# Benchmarks

`run_benchmark.py` measures:

- API submission latency
- end-to-end job latency
- completion/failure/timeout rate

Example in Colab:

```python
%env WEARO_TRYON_URL=https://your-gpu-service.example.com
%env WEARO_TRYON_TOKEN=***
%env WEARO_PERSON_IMAGE_URL=https://...
%env WEARO_GARMENT_IMAGE_URL=https://...
!python ai-lab/benchmarks/run_benchmark.py
```

Do not commit real credentials or customer image URLs.
