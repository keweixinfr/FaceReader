import requests

url="https://facereader.herokuapp.com/upload/"
files = {'image': open('test.jpg', 'rb')}

r = requests.post(url,files=files)
print r.text

with open( 'test.jpg','rb') as imgdata:
    files = {'image': imgdata}
    response = requests.post(url,files=files)
    result=response.text
    print response
    print result