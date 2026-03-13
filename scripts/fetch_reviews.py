import json
import urllib.request

url = 'https://places.googleapis.com/v1/places/ChIJow_rX82ZpkARFvc5NRlpVgM?fields=displayName,rating,userRatingCount,reviews&key=AIzaSyCnT_KdTLViu_Emj26mSCCYvXSlAy-cQrI'
print('Fetching:', url)
with urllib.request.urlopen(url) as r:
    data = json.load(r)
print(json.dumps(data, indent=2, ensure_ascii=False)[:4000])
