
from django.shortcuts import render
import csv

from pymongo.mongo_client import MongoClient
from pymongo.server_api import ServerApi

from django.http import HttpResponse
import json
from bson import ObjectId

import base64
from PIL import Image
import io


client = MongoClient("mongodb+srv://neocity:WHZjwyXmIrjMmVao@cluster0.gql3p.mongodb.net/?retryWrites=true&w=majority", server_api=ServerApi('1'))
db = client["inventory"]
all_items = db["items"]
all_tags = db["tags"]

def image_to_base64(image_data):
    image_buffer = io.BytesIO(image_data)
    image = Image.open(image_buffer)
    image = image.convert('RGB')
    width, height = image.size
    image = image.resize((100, int(height/width*100)), Image.Resampling.LANCZOS)
    png_buffer = io.BytesIO()
    image.save(png_buffer, format='PNG', optimize=True, quality=85)
    base64_image = base64.b64encode(png_buffer.getvalue()).decode('utf-8')

    return base64_image


def run_script_view(request):
    if request.method == 'POST':
        value = json.loads(request.body)
        if value.get('trulyDelete'):
            data = str(json.loads(request.body)["trulyDelete"])
            if data == "yes":
                items = all_items.find()
                for item in items:
                    all_items.delete_one(item)
                return render(request, 'inventory.html', {'documents': []})
        if value.get('remove'):
            data = eval(json.loads(request.body)["remove"])
            all_items.delete_one({"_id": data})
        elif value.get('edit'):
            data = eval(json.loads(request.body)["edit"])
            items = all_items.find({"_id": data})

            if (items):
                return HttpResponse(status=200)
            else: 
                return HttpResponse(status=404)
   
    all_documents_list = list(all_items.find())
    tags = list(all_tags.find())

    return render(request, 'inventory.html', {'documents': all_documents_list, "tags" : tags})

def home(request):
    return render(request, 'index.html')

def handle_uploaded_file(request):
    csv_file = request.FILES['file_upload']
    csv_data = csv_file.read().decode('utf-8')  # Convert binary data to a string

    # Initialize an empty list to store the data from the CSV file
    data = []

    # Read the CSV data and store its contents in the 'data' list
    reader = csv.reader(csv_data.splitlines())
    header = next(reader)
    for row in reader:
        data.append(row)

    for row in data:
        if len(row) != 5:
            continue
        name, part_number, description, quantity, location = row
        document = {"name": name, "part_number": part_number, "description": description, "quantity": quantity, "location": location}
        all_items.insert_one(document)

    return HttpResponse("CSV data has been parsed and processed successfully!")

def create_item(request):
    tags = list(all_tags.find())

    if request.FILES.get('file_upload'):
        handle_uploaded_file(request)
    else:
        requests = [request.POST.get('name'), request.POST.get('part_number'), request.POST.get('description'), request.POST.get('quantity'), request.POST.get('location'), request.POST.get('tags')]
        if requests.count(None) > 0: 
            return render(request, 'create_item.html', {"documents": tags})
        
        name, part_number, description, quantity, location, tag = requests
        new_tags = [tags[int(i)] for i in tag.split(",")]
        document = {"name": name, "part_number": part_number, "description": description, "quantity": quantity, "location": location, "image": "", "tags" : new_tags}

        if request.FILES.get('image'):
            image = request.FILES['image']
            document["image"] = image_to_base64(image.read())

        all_items.insert_one(document)

    return render(request, 'create_item.html', {"documents": tags})

def rgb_to_hex(r, g, b):
    return '#{:02x}{:02x}{:02x}'.format(r, g, b)

def edit_tags(request):
    tags = list(all_tags.find())
    
    if request.method == "POST":
        if request.META.get('CONTENT_TYPE') == 'application/json' and json.loads(request.body).get('delete'):
            name = str(json.loads(request.body)["delete"])
            all_tags.delete_one({"name" : name})

            current_items = list(all_items.find({
                "tags": {"$elemMatch": {"name": name}}
            }))

            for item in current_items:
                item = dict(item)
                current_tags = item["tags"]
                for current_tag in current_tags:
                    if current_tag["name"] == name:
                        current_tags.remove(current_tag)

                all_items.replace_one({"_id" : item["_id"]}, item)

            return render(request, 'edit_tags.html', {"tags" : list(all_tags.find())}) 
        else:
            requests = [request.POST.get('name'), request.POST.get('description'), request.POST.get('rgbR'),
                        request.POST.get('rgbG'),  request.POST.get('rgbB')]

            if requests.count(None) > 0:
                return render(request, 'edit_tags.html', {"tags" : tags})

            name, description, r, g, b = requests

            if len([tag for tag in tags if tag["name"] == name]) == 0:
                hexColor = rgb_to_hex(max(0, min(int(r), 255)), max(0, min(int(g), 255)), max(0, min(int(b), 255)))

                all_tags.insert_one({
                    "name": name,
                    "description": description,
                    "color": hexColor
                })

                return render(request, 'edit_tags.html', {"tags" : list(all_tags.find())})

    return render(request, 'edit_tags.html', {"tags" : tags})

def edit_item(request):
    _id = request.GET.get('id', None)

    if not _id:
        return HttpResponse(status=404)
    
    tags = list(all_tags.find())
    requests = [request.POST.get('name'), request.POST.get('part_number'), request.POST.get('description'), request.POST.get('quantity'), request.POST.get('location')]
    
    if (requests.count(None) > 0 or requests.count("") > 0):
        response_data = all_items.find({"_id": ObjectId(_id)})[0]
        new_response = {item: response_data[item] for item in response_data if item != "_id"}
        if new_response.get("tags"):
            new_response["tags"] = [{item: tag[item] for item in tag if item != "_id"} for tag in new_response["tags"]]

        return render(request, 'edit_item.html', {"items": new_response, "documents": tags})
    
    name, part_number, description, quantity, location = requests
    document = {"name": name, "part_number": part_number, "description": description, "quantity": quantity, "location": location, "image": "", "tags": []}

    if request.POST.get('tags'):
        new_tags = [tags[int(i)] for i in request.POST["tags"].split(",")]
        document["tags"] = new_tags

    if request.FILES.get('image'):
        image = request.FILES['image']
        document["image"] = image_to_base64(image.read())

    all_items.replace_one({"_id": ObjectId(_id)}, document)
    
    return render(request, 'edit_item.html', {"items": "'redirect'", "documents": tags})