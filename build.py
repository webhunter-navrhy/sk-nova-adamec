"""Zostaví index.html + style.css s cache bustingom (?v=hash). Obsah je z nova-milosadamec.sk (podklady/)."""
import hashlib, json
from pathlib import Path
D = Path(__file__).parent

# názov, popis (texty z ich stránky Stavebné činnosti), fotka, odkaz
SLUZBY = [
    ('Rodinné domy na kľúč', 'Výstavba rodinných domov od zabezpečenia projektovej dokumentácie cez realizáciu stavby až po odovzdanie na kľúč.', 'sl-dom', 'Rodinný dom na kľúč'),
    ('Občianske a úžitkové stavby', 'Stavby rôzneho druhu – občianske aj úžitkové, od prípravy až po dokončenie.', 'sl-obc', 'Iná stavba'),
    ('Rekonštrukcie', 'Čiastočné aj kompletné rekonštrukcie domov, bytov, bytových jadier a stavieb všetkého druhu.', 'sl-rek', 'Rekonštrukcia'),
    ('Drevodomy a drevostavby', 'Výstavba drevodomov a drevostavieb – ako alternatíva k murovanému domu.', 'sl-drevo', 'Drevostavba'),
    ('Strechy, krovy, krytiny', 'Kompletné zabezpečenie výstavby aj rekonštrukcie striech – krovy, strešné krytiny.', 'sl-strecha', 'Strecha'),
    ('Zatepľovanie a fasády', 'Zateplenie domu a nová fasáda pri novostavbe aj pri rekonštrukcii.', 'sl-fasada', 'Zateplenie / fasáda'),
    ('Sadrokartónové konštrukcie', 'Sadrokartónové konštrukcie v interiéri – pri novostavbe aj pri rekonštrukcii.', 'sl-sdk', 'Sadrokartón'),
    ('Stavebný dozor', 'Kompletné služby stavebného dozoru, vykonávané odbornou osobou s osvedčením SKSI.', 'sl-dozor', 'Stavebný dozor'),
]
KROKY = [
    ('Projekt', 'Začíname pri papieri. Zabezpečíme projektovú dokumentáciu a poradíme pri výbere riešenia aj materiálov.'),
    ('Hrubá stavba', 'Základy, murivo, stropy. Postup volíme podľa technológie – a dodržíme ho.'),
    ('Krov a strecha', 'Krov aj strešnú krytinu zabezpečíme kompletne, pri novostavbe aj pri rekonštrukcii.'),
    ('Zateplenie a fasáda', 'Dom zateplíme a dostane fasádu. Vnútri podľa potreby pribudnú sadrokartónové konštrukcie.'),
    ('Na kľúč', 'Stavbu odovzdáme pripravenú na bývanie. A keď treba niečo doriešiť, postaráme sa – so záručným aj pozáručným servisom.'),
]
DOZOR = [
    'Sleduje spôsob a postup uskutočňovania stavby, aby sa na nej použili čo najlepšie stavebné postupy.',
    'Zodpovedá za riadnu inštaláciu a prevádzku technického vybavenia na stavbe.',
    'Dbá na správny a odborný výber stavebných výrobkov a hmôt a sleduje vedenie stavebného denníka.',
    'Zodpovedá za súlad priestorovej polohy stavby so stavebnou dokumentáciou a za dodržanie všeobecných technických požiadaviek na výstavbu.',
    'Stráži dodržanie rozhodnutí vydaných na uskutočnenie stavby, najmä územného a stavebného rozhodnutia.',
    'Stará sa o bezpečnosť a ochranu zdravia pri práci.',
    'Dbá na odstránenie chýb, ktoré na stavbe vznikli.',
]
TYPY = ['Rodinný dom na kľúč', 'Rekonštrukcia', 'Drevostavba', 'Strecha', 'Zateplenie / fasáda', 'Sadrokartón', 'Stavebný dozor', 'Iná stavba']
FAZY = ['Len plánujem', 'Mám projekt', 'Mám stavebné povolenie', 'Stavba už beží']

marquee = ''.join(f'<span>{s[0]}</span><b>✦</b>' for s in SLUZBY) * 2

sluzby = '\n'.join(
    f'''      <li class="row rv" data-img="img/{img}.jpg">
        <span class="row__n">{i:02d}</span>
        <h3>{n}</h3>
        <p>{p}</p>
        <img class="row__img" src="img/{img}.jpg" alt="" loading="lazy">
        <a href="{'#dozor' if img == 'sl-dozor' else '#kontakt'}" {'' if img == 'sl-dozor' else f'data-typ="{t}"'} class="row__a" aria-label="{n} – viac"><span aria-hidden="true">→</span></a>
      </li>''' for i, (n, p, img, t) in enumerate(SLUZBY, 1))

kroky = '\n'.join(
    f'''        <li class="step" data-step="{i}"><span class="step__n">{i:02d}</span><h3>{n}</h3><p>{p}</p></li>'''
    for i, (n, p) in enumerate(KROKY, 1))

dozor = '\n'.join(
    f'''        <li class="entry rv"><span class="entry__n">Zápis {i:02d}</span><p>{t}</p><svg class="tick" viewBox="0 0 24 24" aria-hidden="true"><path pathLength="1" d="M4 12.5l5 5L20 6.5"/></svg></li>'''
    for i, t in enumerate(DOZOR, 1))

chip = lambda nm, v: f'<label class="chip"><input type="radio" name="{nm}" value="{v}"><span>{v}</span></label>'
typy = ''.join(chip('typ', t) for t in TYPY)
fazy = ''.join(chip('faza', t) for t in FAZY)

g = json.load(open(D / 'galeria.json'))
n_all = len(g['poradie'])
galeria = '\n'.join(
    f'      <figure class="gi rv" data-full="img/g-{n}.jpg"><img src="img/t-{n}.jpg" alt="Stavba realizovaná spoločnosťou NOVA – Miloš Adamec" loading="lazy" width="{g["rozmery"][str(n)][0]}" height="{g["rozmery"][str(n)][1]}"><figcaption>Stavba {i:02d} <span>/ {n_all:02d}</span></figcaption></figure>'
    for i, n in enumerate(g['poradie'], 1))

css = (D / 'fonts/fonts.css').read_text() + '\n' + (D / 'style.src.css').read_text()
(D / 'style.css').write_text(css)
h = lambda b: hashlib.md5(b).hexdigest()[:8]
html = (D / 'src.html').read_text()
for k, v in dict(marquee=marquee, sluzby=sluzby, kroky=kroky, dozor=dozor, typy=typy, fazy=fazy, galeria=galeria).items():
    html = html.replace('{{' + k + '}}', v)
html = html.replace('{{css}}', h(css.encode())).replace('{{js}}', h((D / 'main.js').read_bytes()))
assert '{{' not in html
(D / 'index.html').write_text(html)
(D / 'robots.txt').write_text('User-agent: *\nDisallow: /\n')
print('ok', n_all, 'fotiek v galérii')
