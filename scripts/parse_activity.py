import json

with open('d:/WealthWise/docs/WealthWise_Activity_Diagram.mdj', 'r', encoding='utf-8') as f:
    data = json.load(f)

id_map = {}
def map_ids(e):
    if isinstance(e, dict):
        if '_id' in e:
            id_map[e['_id']] = f"{e.get('_type', '')}: {e.get('name', '')}"
        for v in e.values():
            map_ids(v)
    elif isinstance(e, list):
        for item in e:
            map_ids(item)

map_ids(data)

def find_flows(e):
    flows = []
    if isinstance(e, dict):
        if e.get('_type') == 'UMLControlFlow':
            flows.append((e.get('name', ''), e.get('source', {}).get('$ref'), e.get('target', {}).get('$ref')))
        for v in e.values():
            flows.extend(find_flows(v))
    elif isinstance(e, list):
        for item in e:
            flows.extend(find_flows(item))
    return flows

for name, s, t in find_flows(data):
    print(f"{id_map.get(s, s)}  ==[{name}]==>  {id_map.get(t, t)}")
