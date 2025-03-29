from django.db import models
import uuid

class Session(models.Model):
    uuid = models.UUIDField(default=uuid.uuid4, unique=True, editable=False)
    created_at = models.DateTimeField(auto_now_add=True)

class Event(models.Model):
    session = models.ForeignKey(Session, on_delete=models.CASCADE, related_name='events')
    title = models.CharField(max_length=255)
    location = models.CharField(max_length=255, blank=True)
    start_time = models.DateTimeField()
    end_time = models.DateTimeField()
    weekday = models.CharField(max_length=10)