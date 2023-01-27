from flask import Flask, request, jsonify
from werkzeug.utils import secure_filename
import boto3
from botocore.exceptions import ClientError, WaiterError
import tempfile
import os

app = Flask(__name__)
session = boto3.Session()
storj_resource = session.resource('s3')
storj_client = boto3.client('s3',
                            aws_access_key_id=os.environ['STORJ_ACCESS_KEY'],
                            aws_secret_access_key=os.environ['STORJ_SECRET_KEY'],
                            endpoint_url=os.environ['STORJ_END_POINT']
                            )


def upload_storj(filecontent, filename, bucket_name):
    head = None
    bucket_obj = None
    try:
        bucket = storj_resource.Bucket(bucket_name)
    except ClientError:
        bucket = None

    try:
        # In case filename already exists, get current etag to check if the
        # contents change after upload
        head = storj_client.head_object(Bucket=bucket_name, Key=filename)
    except ClientError:
        etag = ''
    else:
        etag = head['ETag'].strip('"')

    try:
        bucket_obj = bucket.Object(filename)
    except (ClientError, AttributeError):
        bucket_obj = None

    try:
        # Use the upload_fileobj method to safely upload the file
        storj_client.upload_fileobj(
            Fileobj=filecontent,
            Bucket=bucket_name,
            Key=filename
        )
    except (ClientError, AttributeError):
        pass
    else:
        try:
            bucket_obj.wait_until_exists(IfNoneMatch=etag)
        except WaiterError:
            pass
        else:
            head = storj_client.head_object(Bucket=bucket_name, Key=filename)
    return head


@app.route('/api/upload', methods=['post'])
def upload():
    # check if the post request has the file part
    if 'file' not in request.files:
        return json({'error': 'No file part'}, status=400)
    file = request.files.get('file')
    # if user does not select file, browser also
    # submit a empty part without filename
    if file.name == '':
        return json({'error': 'No selected file'}, status=400)
    if file:
        # save the file
        filename = secure_filename(file.name)
        # Save the file to a temporary location
        with tempfile.TemporaryDirectory() as temp_dir:
            temp_path = os.path.join(temp_dir, filename)
            file.save(temp_path)
            # Open the file in binary mode
            with open(temp_path, 'rb') as filecontent:
                result = upload_storj(filecontent, filename, 'discoursio')
    return json({'message': 'File uploaded'}, status=200)
