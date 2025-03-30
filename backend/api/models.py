from django.db import models
import uuid

class Session(models.Model):
    uuid = models.UUIDField(default=uuid.uuid4, unique=True, editable=False)
    created_at = models.DateTimeField(auto_now_add=True)

class Event(models.Model):
    session = models.ForeignKey(Session, on_delete=models.CASCADE, related_name='events')
    title = models.CharField(max_length=255)
    location = models.CharField(max_length=255)
    start_time = models.TimeField(null=True)
    end_time = models.TimeField(null=True)
    start_date = models.DateField(null=True)
    end_date = models.DateField(null=True)
    day_of_week = models.JSONField(default=list)
    latitude = models.FloatField(null=True, blank=True)
    longitude = models.FloatField(null=True, blank=True)