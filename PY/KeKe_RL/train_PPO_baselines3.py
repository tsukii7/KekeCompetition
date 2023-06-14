import time

import gym
import numpy as np
from stable_baselines3 import PPO
from stable_baselines3.common.vec_env.dummy_vec_env import DummyVecEnv

# from KeKe_env import KeKeEnv

PATTERN = 'new'
# PATTERN = 'origin'
DIFFICULTY = 1
EPOCH = 100
TIMESTEP = 10000
test = True
path = f"./model/KeKe_PPO_{PATTERN}_{DIFFICULTY}_{TIMESTEP}.pkl"

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


def progress_bar(finish_tasks_number, tasks_number, complete_time, won_tasks_number):
    """
    进度条

    :param finish_tasks_number: int, 已完成的任务数
    :param tasks_number: int, 总的任务数
    :param complete_time: float, 已完成的任务所消耗的总时间
    :return:
    """

    percentage = finish_tasks_number / tasks_number * 100
    finished_label = "▓" * (round(percentage) // 2)
    unfinished_label = "-" * (100 - round(percentage))
    arrow = "->"
    if not finished_label or not unfinished_label:
        arrow = ""
    print("\r{:.2f}% [{}{}{}] {:.2f}s won tasks: {}".format(percentage, finished_label, arrow, unfinished_label,
                                                            complete_time, won_tasks_number),
          end="")


# 加载你的环境
env = gym.make('KeKe-v0')

# Stable Baselines3 的 PPO 算法需要一个向量化的环境。这里我们使用 DummyVecEnv 作为向量化环境的简单版本。
env = DummyVecEnv([lambda: env])

model = PPO("MlpPolicy",
            env=env,
            batch_size=64,
            gae_lambda=0.98,
            gamma=0.999,
            n_epochs=4,
            ent_coef=0.01,
            verbose=1,
            tensorboard_log="./tensorboard/KeKe-v0/"
            )

if not test:
    model.learn(total_timesteps=TIMESTEP)

    model.save(path)
path = f"./model/KeKe_PPO_{PATTERN}_{DIFFICULTY}_{TIMESTEP}_decrease.pkl"
model = PPO.load(path)
print(f"Load model: {path}")

passed_episodes = 0
action_histories = []
times = []

for i in range(EPOCH):
    start = time.time()
    state = env.reset()
    done = False
    total_reward = 0
    action_history = []

    while not done:
        if time.time() - start > 10 or len(action_history) > 1e4:
            break
        action, _ = model.predict(observation=state)
        next_state, reward, done, info = env.step(action)
        state = next_state
        action_history.append(["up", "down", "left", "right", "space"][action[0]])
        total_reward += reward
        if info[0]['won']:
            passed_episodes += 1
            break
        # env.render()
        # print(reward)
    action_histories.append(action_history)
    times.append(time.time() - start)
    progress_bar(finish_tasks_number=i, tasks_number=EPOCH, complete_time=0, won_tasks_number=passed_episodes)

env.close()
pass_rate = passed_episodes / EPOCH
avg_length = np.array([len(i) for i in action_histories]).mean()
avg_runtime = np.array(times).mean()
print(f"\nPass rate: {round(pass_rate * 100, 2)}%", end="")
print(f" Solution length: {round(avg_length, 2)}", end="")
print(f" Runtime: {round(avg_runtime, 2)}", end="")
print(f" (time*len)^-1: {format(1 / (avg_length * avg_runtime), '.4e')}", end="")
