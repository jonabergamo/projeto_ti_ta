from django.db import models
from . import User, IncubatorSetting
import uuid
from django.utils import timezone

class IncubatorDevice(models.Model):
    unique_id = models.CharField(max_length=255, unique=True, primary_key=True, default=uuid.uuid4, editable=False)
    name=models.CharField(max_length=255)
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    current_setting = models.ForeignKey(IncubatorSetting, on_delete=models.SET_NULL, null=True, blank=True, related_name='assigned_devices')
    is_on = models.BooleanField(default=False)
    humidity_sensor = models.FloatField(max_length=100, default=0)
    temperature_sensor = models.FloatField(max_length=100, default=0)
    start_time = models.DateTimeField(null=True, blank=True)
    last_completion_data = models.DateTimeField(null=True, blank=True)

    def __str__(self):
        return f"{self.user.username}'s Incubator Device"

    def save(self, *args, **kwargs):
        if self.is_on and self.start_time is None:
            # Atualizar start_time apenas se o dispositivo está sendo ligado e start_time ainda não foi definido
            self.start_time = timezone.now()
        elif not self.is_on:
            # Definir start_time como None quando o dispositivo for desligado
            self.start_time = None
        super().save(*args, **kwargs)
