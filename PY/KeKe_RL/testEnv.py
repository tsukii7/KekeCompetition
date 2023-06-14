import gymnasium as gym
from stable_baselines3.common.vec_env import DummyVecEnv
import numpy as np

level1 = [
    ['_', '_', '_', '_', '_', '_', '_', '_', '_', '_'],
    ['_', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', '_'],
    ['_', ' ', 'b', ' ', 'f', ' ', ' ', ' ', ' ', '_'],
    ['_', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', '_'],
    ['_', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', '_'],
    ['_', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', '_'],
    ['_', ' ', 'B', '1', '2', ' ', ' ', ' ', 'F', '_'],
    ['_', ' ', ' ', ' ', ' ', ' ', ' ', ' ', '1', '_'],
    ['_', ' ', ' ', ' ', ' ', ' ', ' ', ' ', '3', '_'],
    ['_', '_', '_', '_', '_', '_', '_', '_', '_', '_']
]
level15 = [
    ["_", "_", "_", "_", "_", "_", "_", "_", "_", "_"],
    ["_", "F", "1", "3", " ", " ", " ", " ", "G", "_"],
    ["_", " ", " ", "R", "1", "5", "a", " ", "1", "_"],
    ["_", " ", " ", " ", " ", " ", " ", " ", "0", "_"],
    ["_", "a", " ", "A", " ", "b", " ", "a", " ", "_"],
    ["_", " ", " ", " ", " ", "a", " ", " ", " ", "_"],
    ["_", "B", " ", " ", " ", " ", "g", "g", "g", "_"],
    ["_", "1", " ", "a", " ", "a", "g", " ", "a", "_"],
    ["_", "2", " ", " ", " ", " ", "g", " ", "f", "_"],
    ["_", "_", "_", "_", "_", "_", "_", "_", "_", "_"]
]

action_name = ['up', 'down', 'left', 'right', 'space']

env = gym.make('KeKe-v0')
# env = DummyVecEnv([lambda: env])
env.reset()
env.render()


def print_map(map_arr):
    for row in map_arr:
        print(' '.join(row))


if __name__ == '__main__':
    # s = '__________\n_....B12._\n_....F13._\n_k.b....._\n_....K1.._\n_....fR.._\n_........_\n_........_\n_....r..._\n__________'
    print('初始化完成')

    done = False
    while not done:
        action = int(input('选择动作：[1]up [2]down [3]left [4]right [5]space\n')) - 1
        print(f'执行动作：{action_name[action]}')
        state, reward, done, trunc, info = env.step(action)
        env.render()
        print('reward: %.3f \t done: %s' % (reward, done))

# up, down, left, right, space
# 0,    1,    2,    3,     4
# action = ['left', 'up', 'up','right','right', 'down']
# action = ['up','right','right','up','up','left','left','left','down','down','up','up','right','down','down']
# action = ['right','right', 'down']
# action = [3, 3, 4]
# for a in action:
#     state, reward, done, info = env.step([a])
#     env.render()
#
#     # print(state)
#     print("reward: %.3f \t done: " % reward, end="")
#     print(str(done) + "\n")
