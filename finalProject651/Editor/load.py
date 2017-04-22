from Editor import models
import ast

def loadFromSQL():
    print("[Server]Loading op from database")
    op = []
    serverVersion = 0
    print(type(models.Ver))
    if models.Ver.objects is not None:
        for entry in models.Ver.objects.all():
            op_str = entry.Op
            op_list = ast.literal_eval(op_str)
            op.append(op_list)
            serverVersion += 1
    print("[Server]Op loading complete, Op size: " + str(len(op)))
    print(op)
    print("[Server]Server version: " + str(serverVersion))
    return op, serverVersion