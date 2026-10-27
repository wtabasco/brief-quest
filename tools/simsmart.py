import asyncio, json, sys
from playwright.async_api import async_playwright
from tl import F
SCEN = [
 {'name':'inicio nv3 (sin nada)', 'lvl':3, 'bosses':0, 'skills':['idea','priorizar'], 'items':{'cafe':2}},
 {'name':'nv3 + mate de Fede', 'lvl':3, 'bosses':0, 'skills':['idea','priorizar'], 'items':{'cafe':2, 'mate':1}, 'buff':'fede'},
 {'name':'nv5 consejo Lía', 'lvl':5, 'bosses':0, 'skills':['idea','priorizar','brainstorm','afull'], 'items':{'cafe':2,'mate':1,'foto':1}, 'buff':'atk'},
 {'name':'nv7 libreta+foto', 'lvl':7, 'bosses':0, 'skills':['brainstorm','prueba','brief','afull'], 'items':{'cafe':2,'mate':2,'libreta':1,'foto':1}, 'buff':'fede', 'bonus':{'hp':0,'atk':2,'def':2,'spd':0}},
 {'name':'nv9 1 cliente', 'lvl':9, 'bosses':1, 'skills':['brainstorm','prueba','afull','atajo','medir'], 'items':{'cafe':2,'mate':2,'alfajor':1,'libreta':1,'foto':2,'playlist':1}, 'buff':'duo', 'bonus':{'hp':3,'atk':3,'def':2,'spd':1}},
 {'name':'nv12 2 clientes', 'lvl':12, 'bosses':2, 'skills':['limites','explota','afull','medir'], 'items':{'cafe':2,'mate':2,'alfajor':2,'libreta':1,'foto':1,'pendrive':1}, 'buff':'fede', 'bonus':{'hp':6,'atk':5,'def':3,'spd':2}},
 {'name':'nv16 3 clientes', 'lvl':16, 'bosses':3, 'skills':['concepto','argumentar','afull','dinamica'], 'items':{'mate':2,'alfajor':2,'medialunas':1,'libreta':2,'foto':2}, 'buff':'duo', 'bonus':{'hp':10,'atk':6,'def':4,'spd':3}},
 {'name':'nv16 sin preparar', 'lvl':16, 'bosses':3, 'skills':['brainstorm','brief','idea','priorizar'], 'items':{}, 'bonus':{'hp':10,'atk':3,'def':2,'spd':0}},
]
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch(); pg = await b.new_page()
        await pg.route('**/fonts.googleapis.com/**', lambda r: r.abort())
        await pg.set_content('<!doctype html><html><head><meta charset="utf-8"></head><body>'+open(F).read()+'</body></html>')
        await pg.wait_for_timeout(1000)
        await pg.evaluate("()=>{ H.length=0; }")
        r = await pg.evaluate(open('/home/claude/check/sim_smart.js').read(), {'n': int(sys.argv[1]) if len(sys.argv) > 1 else 1500, 'scen': SCEN})
        for x in r: print(x)
        await b.close()
asyncio.run(main())
