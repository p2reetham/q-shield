FROM python:3.11-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY . .
RUN python ml/generate_dataset.py && python ml/train_model.py
EXPOSE 8000
CMD ["python", "run.py"]
