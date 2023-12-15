from api.models import IncubatorDevice
from graphene_django import DjangoObjectType

class IncubatorDeviceType(DjangoObjectType):
    class Meta:
        model = IncubatorDevice
        fields = '__all__'  # Isso expõe todos os campos do modelo no GraphQL

