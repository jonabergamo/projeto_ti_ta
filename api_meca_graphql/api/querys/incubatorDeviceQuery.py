import graphene
from api.models import IncubatorDevice
from api.types import IncubatorDeviceType
from datetime import datetime, timezone


class IncubatorDeviceQuery(graphene.ObjectType):
    all_incubator_devices = graphene.List(IncubatorDeviceType)
    incubator_device = graphene.Field(IncubatorDeviceType, unique_id=graphene.String())
    user_incubator_devices = graphene.List(IncubatorDeviceType, user_id=graphene.Int())

    def resolve_all_incubator_devices(self, info):
        user = info.context.user
        if not user.is_authenticated:
            raise Exception("Authentication credentials were not provided")
        return IncubatorDevice.objects.all()

    def resolve_incubator_device(self, info, unique_id):
        user = info.context.user
        if not user.is_authenticated:
            raise Exception("Authentication credentials were not provided")
        try:
            device = IncubatorDevice.objects.get(unique_id=unique_id)
            if device.is_on and device.start_time and device.current_setting:
                elapsed_time = datetime.now(timezone.utc) - device.start_time
                incubation_duration = device.current_setting.incubation_duration
                incubation_completed = elapsed_time.total_seconds() >= incubation_duration * 3600

                if incubation_completed:
                    device.is_on = False  # Desligar o dispositivo
                    device.last_completion_data = datetime.now(timezone.utc)
            device.save()
            return IncubatorDevice.objects.get(unique_id=unique_id)
        except IncubatorDevice.DoesNotExist:
            return None
        
    def resolve_user_incubator_devices(self, info, user_id):
        user = info.context.user
        if not user.is_authenticated:
            raise Exception("Authentication credentials were not provided")
        
        # Filtrar dispositivos pelo user_id
        return IncubatorDevice.objects.filter(user_id=user_id)