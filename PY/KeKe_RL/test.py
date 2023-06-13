import torch

if __name__ == '__main__':
    device = torch.device("cuda:0" if torch.cuda.is_available() else "cpu")
    print(device)

import torch
print(torch.__version__)  #注意是双下划线
print(torch.cuda.is_available())