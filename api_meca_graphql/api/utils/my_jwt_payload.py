from graphql_jwt.utils import jwt_payload

def my_jwt_payload(user, context=None):
    payload = jwt_payload(user, context)

    # Adicione informações adicionais aqui
    payload['email'] = user.email

    return payload