import re, json, sys
src = open(sys.argv[1], encoding='utf8').read().split('\n')
out = sys.argv[2]

NAMEKEY = {'Riku':'me','Sion':'sion','Yushi':'yushi','Daeyoung':'daeyoung','Ryo':'ryo','Sakuya':'sakuya',
 'Mama':'mama','Coach Jaehyun':'coach','Jeno':'jeno','Haechan':'haechan','Jisung':'jisung','Jaemin':'jaemin'}
MSG = re.compile(r'(\d{2}\.\d{2}) \*\*([^*]+?)\*\*: ')
counters = {'foto':0,'vn':0,'vid':0}
def nid(p):
    counters[p]+=1; return '%s-%02d'%(p,counters[p])

def paras(lines):
    res=[];cur=[]
    for l in lines:
        if l.strip()=='':
            if cur: res.append(' '.join(cur)); cur=[]
        elif l.startswith('|'): continue
        else: cur.append(l.strip())
    if cur: res.append(' '.join(cur))
    return res

def msg_items(par):
    parts = MSG.split(par)
    items=[]
    for i in range(1,len(parts),3):
        t,name,text = parts[i],parts[i+1].strip(),parts[i+2].strip()
        it={'k':'msg','t':t,'from':NAMEKEY.get(name,name.lower())}
        m=re.fullmatch(r'\[FOTO: (.+?)\]',text)
        v=re.fullmatch(r'\[VOICE NOTE (\d+:\d+)\.?\s*(.*?)\]',text)
        vd=re.fullmatch(r'\[VIDEO (\d+:\d+): (.+?)\]',text)
        if m: it.update(type='photo',id=nid('foto'),desc=m.group(1))
        elif v: it.update(type='voice',id=nid('vn'),dur=v.group(1),desc=v.group(2))
        elif vd: it.update(type='video',id=nid('vid'),dur=vd.group(1),desc=vd.group(2))
        else: it['text']=text
        items.append(it)
    return items

def narr_items(par):
    m=re.fullmatch(r'\*\[(.+)\]\*',par)
    if not m: return None
    s=m.group(1)
    b=re.search(r'baterai Riku (\d+)%',s)
    if re.fullmatch(r'baterai Riku \d+%',s): return [{'k':'battery','v':int(b.group(1))}]
    ty=re.match(r'(\w+) sedang mengetik',s)
    if ty: return [{'k':'typing','who':ty.group(1)}]
    if s.startswith('teks besar di layar'):
        r=[{'k':'big','text':re.search(r'layar: (\d{2}\.\d{2})',s).group(1)}]
        if b: r.append({'k':'battery','v':int(b.group(1))})
        return r
    if s.startswith('TO BE CONTINUED'): return [{'k':'end'}]
    items=[{'k':'narr','text':s}]
    if 'membuka grup' in s: items.append({'k':'switch','chat':'mieayam'})
    if b and not s.startswith('panggilan'): items.append({'k':'battery','v':int(b.group(1))})
    return items

def find(prefix):
    for i,l in enumerate(src):
        if l.startswith(prefix): return i
    raise Exception(prefix)
def H(l): return re.sub(r'^#+ ','',l).replace('**','').strip()

def parse_notes(a,b):
    notes=[];cur=None
    for l in src[a:b]:
        if l.startswith('### '):
            if cur: notes.append(cur)
            cur={'title':H(l),'lines':[]}
        elif cur is not None: cur['lines'].append(l)
    if cur: notes.append(cur)
    res=[]
    for n in notes:
        body=[p for p in paras(n['lines']) if not p.startswith('Ini tampilan') and not p.startswith('Semua catatan')]
        title=re.sub(r'^catatan \d+\.\s*','',n['title'])
        num=int(re.match(r'catatan (\d+)',n['title']).group(1))
        res.append({'no':num,'title':title,'date':title.split('.')[0],'body':body})
    return res

p1=find('# **BAGIAN 1'); p2=find('# **BAGIAN 2'); p3=find('# **BAGIAN 3'); p4=find('# **BAGIAN 4'); pe=find('# **RANCANGAN LANJUTAN')
notes_hist=parse_notes(p1,p2)

CHAT_SECTIONS={'2A':'voli','2B':'mieayam','2C':'daeyoung','2D':'sion','2E':'yushi','2F':'ryo','2G':'sakuya','2H':'mama','2I':'coach'}
chats={}
idx=[i for i in range(p2,p3) if src[i].startswith('## ')]+[p3]
for a,b in zip(idx[:-1],idx[1:]):
    title=H(src[a]); key=CHAT_SECTIONS[title[:2]]
    members=None; items=[]
    for p in paras(src[a+1:b]):
        if p.startswith('Anggota:'): members=p[8:].strip().rstrip('.'); continue
        n=narr_items(p)
        if n: items+=n; continue
        m=re.fullmatch(r'\*\*(.+)\*\*',p)
        if m: items.append({'k':'date','label':m.group(1)}); continue
        if MSG.search(p): items+=msg_items(p)
    chats[key]={'title':re.sub(r'^2\w\. (GRUP|CHAT PRIBADI|CHAT): ','',title),'members':members,'history':items}

t0=find('## **3A'); t1=find('## **3B'); t2=find('## **3C'); t3=find('## **3D'); t4=find('## **3E')
acc={}
def parse_tweets(lines,tweets,date=None):
    for p in paras(lines):
        if p.startswith('Akun yang muncul'): continue
        if p.startswith('- **@'):
            for h,d in re.findall(r'\*\*(@\w+)\*\*: ([^*]+?)(?=\s*- \*\*@|\s*$)',p): acc[h]=d.strip()
            continue
        d=re.fullmatch(r'\*\*([^*@]+)\*\*',p)
        if d: date=d.group(1); continue
        m=re.match(r'\*\*(@\w+)\*\*\s*(\(([^)]+)\))?\s*(.+)',p)
        if m:
            if m.group(3): acc[m.group(1)]=m.group(3)
            tweets.append({'k':'tweet','handle':m.group(1),'date':date,'text':m.group(4)})
            continue
        n=narr_items(p)
        if n: tweets+=n
tweets=[]
parse_tweets(src[t0+1:t1],tweets)

def parse_transcript(p):
    lines=[]
    for m in re.finditer(r'\*\*([^*:]+):\*\*\s*(.*?)(?=\s\*\*[^*:]+:\*\*|\s\*\(|$)|\*\((.+?)\)\*',p):
        if m.group(3): lines.append({'action':m.group(3)})
        else: lines.append({'from':NAMEKEY.get(m.group(1).strip(),m.group(1).lower()),'text':m.group(2).strip()})
    return lines
calls=[]
ci=[i for i in range(t1,t2) if src[i].startswith('### ')]+[t2]
for a,b in zip(ci[:-1],ci[1:]):
    h=H(src[a])
    m=re.match(r'(.+?),\s*(\d{2}\.\d{2})\.\s*(.+?) \((\d+:\d+)\)',h)
    day,tm,who,dur=m.groups()
    transcript=[]
    for p in paras(src[a+1:b]):
        if p.startswith('**'): transcript+=parse_transcript(p)
    calls.append({'when':day,'t':tm,'who':NAMEKEY.get(who.replace('Kak ',''),who.lower()),'whoLabel':who,'dur':dur,'lines':transcript})

gallery=[]
for l in src[t2+1:t3]:
    m=re.match(r'- \*\*(.+?)\.\*\* \[(FOTO|VIDEO)(?: (\d+:\d+))?:\s*(.+)\]',l)
    if m: gallery.append({'id':'gal-%02d'%(len(gallery)+1),'when':m.group(1),'type':'video' if m.group(2)=='VIDEO' else 'photo','dur':m.group(3),'desc':m.group(4)})
calendar=[]
for l in src[t3+1:t4]:
    m=re.match(r'- \*\*(\w+) (\d+) (\w+)\.\*\* (.+)',l)
    if m:
        txt=m.group(4); note=''
        if ' Catatan: ' in txt: txt,note=txt.split(' Catatan: ',1)
        calendar.append({'day':int(m.group(2)),'mon':m.group(3),'title':txt.strip().rstrip('.'),'note':note})
insta=[]
for l in src[t4+1:p4]:
    m=re.match(r'- \*\*(Post|Story)( akun sekolah| \w+)?, (\d+ \w+)(?:, (\d{2}\.\d{2}))?\.\*\* (.+)',l)
    if not m: continue
    rest=m.group(5); who=(m.group(2) or '').strip()
    ph=re.match(r'\[FOTO: (.+?)\]\s*(.*)',rest)
    insta.append({'id':'ig-%02d'%(len(insta)+1),'kind':m.group(1).lower(),'author':who if who else 'akun sekolah','when':m.group(3),
      'desc':ph.group(1) if ph else '','caption':(ph.group(2) if ph else rest)})

scenes=[]
hs=[i for i in range(p4,pe) if re.match(r'## \*\*\d{2}\.\d{2} ',src[i])]+[pe]
for a,b in zip(hs[:-1],hs[1:]):
    h=H(src[a]); tm,title=h.split(' ',1)
    body=src[a+1:b]
    sc={'t':tm,'title':title}
    up=title.upper()
    if up.startswith('CATATAN'):
        n=parse_notes(a+1,b)[0]
        sc['type']='note'; sc['note']=n
        sc['notif']={'app':'notes','title':'Catatan','body':'catatan %d. %s'%(n['no'],n['title'])}
    else:
        items=[]
        for p in paras(body):
            n=narr_items(p)
            if n: items+=n; continue
            if MSG.search(p): items+=msg_items(p)
        if up.startswith('TWITTER'):
            tw=[]; parse_tweets(body,tw)
            first=[x for x in tw if x['k']=='tweet'][0]
            sc['type']='twitter'; sc['items']=tw
            sc['notif']={'app':'x','title':first['handle'],'body':first['text'][:110]}
        elif up.startswith('TELEPON'):
            m=re.match(r'TELEPON(?: MASUK)?: (.+?) \((\d+:\d+)\)',title)
            who=m.group(1).title().replace('Kak ','')
            lines=[];intro=None
            for p in paras(body):
                if p.startswith('**'): lines+=parse_transcript(p)
                elif p.startswith('*[') and 'panggilan berakhir' not in p and not intro: intro=p[2:-2]
            sc.update(type='call',who=NAMEKEY.get(who,who.lower()),whoLabel=m.group(1).title(),dur=m.group(2),lines=lines,intro=intro)
            sc['notif']={'app':'phone','title':m.group(1).title(),'body':'Panggilan masuk'}
        else:
            if up.startswith('GRUP') or up.startswith('BEL SEKOLAH'): chat='mieayam'
            else: chat=re.match(r'WHATSAPP: (?:KAK )?(\w+)',up).group(1).lower()
            sc['type']='chat'; sc['chat']=chat; sc['items']=items
    scenes.append(sc)
hdr=' '.join(paras(src[p4+1:hs[0]]))
m=re.search(r'baterai Riku (\d+)%',hdr); init_battery=int(m.group(1)) if m else 38

def dump(o): return json.dumps(o,ensure_ascii=False)
w=['// =====================================================================',
 '//  story.js  -  ISI CERITA. Edit teks di sini (JANGAN ubah nama kunci seperti k:, t:, from:).',
 '//  Dibuat otomatis dari dokumen Word, tapi bebas kamu edit manual.',
 '// =====================================================================',
 'window.STORY = {',' initialBattery: %d,'%init_battery,' accounts: %s,'%dump(acc),' notes: [']
for n in notes_hist: w.append('  '+dump(n)+',')
w.append(' ],'); w.append(' chats: {')
for k,c in chats.items():
    w.append('  %s: {title:%s, members:%s, history:['%(k,dump(c['title']),dump(c['members'])))
    for it in c['history']: w.append('   '+dump(it)+',')
    w.append('  ]},')
w.append(' },')
for name,arr in (('tweets',tweets),):
    w.append(' %s: ['%name)
    for t in arr: w.append('  '+dump(t)+',')
    w.append(' ],')
w.append(' calls: [')
for c in calls:
    w.append('  {when:%s, t:%s, who:%s, whoLabel:%s, dur:%s, lines:['%(dump(c['when']),dump(c['t']),dump(c['who']),dump(c['whoLabel']),dump(c['dur'])))
    for l in c['lines']: w.append('   '+dump(l)+',')
    w.append('  ]},')
w.append(' ],')
for name,arr in (('gallery',gallery),('calendar',calendar),('instagram',insta)):
    w.append(' %s: ['%name)
    for g in arr: w.append('  '+dump(g)+',')
    w.append(' ],')
w.append(' // ---------- HARI INI (Day 9). Urutan scene = urutan cerita berjalan. ----------')
w.append(' scenes: [')
for sc in scenes:
    sc=dict(sc); items=sc.pop('items',None); lines=sc.pop('lines',None)
    w.append('  {'+dump(sc)[1:-1]+',')
    if items is not None:
        w.append('   "items":[')
        for it in items: w.append('    '+dump(it)+',')
        w.append('   ]')
    if lines is not None:
        w.append('   "lines":[')
        for it in lines: w.append('    '+dump(it)+',')
        w.append('   ]')
    w.append('  },')
w.append(' ],'); w.append('};')
open(out,'w',encoding='utf8').write('\n'.join(w))

ph=[]
def collect(items,where):
    for it in items:
        if it.get('type') in('photo','video','voice'): ph.append((it['id'],it['type'],where,it['t'],it.get('desc','')))
for k,c in chats.items(): collect(c['history'],'chat '+k)
for s in scenes:
    if s.get('items'): collect(s['items'],'Day9 '+s['t']+' '+s['title'])
json.dump({'placeholders':ph,'gallery':[(g['id'],g['when'],g['desc']) for g in gallery],'insta':[(g['id'],g['desc']) for g in insta]},open(out+'.ph.json','w'),ensure_ascii=False)
print(len(notes_hist),'catatan;',{k:len(c['history']) for k,c in chats.items()},len(tweets),'tweet;',len(calls),'telepon;',len(gallery),'galeri;',len(calendar),'kalender;',len(insta),'ig;',len(scenes),'scene')
for s in scenes: print(s['t'],s['type'],s.get('chat',''),len(s['items']) if 'items' in s else (len(s['lines']) if 'lines' in s else ''))
