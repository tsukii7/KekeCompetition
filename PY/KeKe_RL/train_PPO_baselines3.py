import time

import gym
import numpy as np
from stable_baselines3 import PPO
from stable_baselines3.common.vec_env.dummy_vec_env import DummyVecEnv

# from KeKe_env import KeKeEnv

PATTERN = 'new'
# PATTERN = 'origin'
DIFFICULTY = 1
# DECREASE = True
DECREASE = False
test = True
# test = False

idx = DIFFICULTY if DIFFICULTY != -1 else 0
TEST_EPOCH = [246, 34, 33, 68, 51, 60][idx]
# TIMESTEP = 10000
TIMESTEP = 10000
ENV_NAME = 'KeKe-v0' if DECREASE or PATTERN == 'origin' else 'KeKe-v1'

if DECREASE and PATTERN == 'new':
    path = f"./model/{ENV_NAME}_PPO_{PATTERN}_{DIFFICULTY}_{TIMESTEP}_decrease.pkl"
else:
    path = f"./model/{ENV_NAME}_PPO_{PATTERN}_{DIFFICULTY}_{TIMESTEP}.pkl"


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


env = gym.make(ENV_NAME)

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
            tensorboard_log=f"./tensorboard/{ENV_NAME}/"
            )

if not test:
    model.learn(total_timesteps=TIMESTEP)

    model.save(path)

model = PPO.load(path)
print(f"Load model: {path}")


pass_rate, avg_length, avg_runtime, ratio = [], [], [], []
for _ in range(5):
    env = gym.make(ENV_NAME)
    passed_episodes = 0
    action_histories = []
    times = []
    for i in range(TEST_EPOCH):
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
            action_history.append(["up", "down", "left", "right", "space"][action])
            total_reward += reward
            if info['won']:
                passed_episodes += 1
                break
            # env.render()
            # print(reward)
        action_histories.append(action_history)
        times.append(time.time() - start)
        progress_bar(finish_tasks_number=i + 1, tasks_number=TEST_EPOCH, complete_time=0,
                     won_tasks_number=passed_episodes)

        env.close()
    pass_rate.append(passed_episodes / TEST_EPOCH)
    avg_length.append(np.array([len(i) for i in action_histories]).mean())
    avg_runtime.append(np.array(times).mean())
    ratio.append(1 / (avg_length[-1] * avg_runtime[-1]))
    print(f"\nPass rate: {round(pass_rate[-1] * 100, 2)}%", end="")
    print(f" Solution length: {round(avg_length[-1], 2)}", end="")
    print(f" Runtime: {round(avg_runtime[-1], 2)}", end="")
    print(f" Ratio[(time*len)^-1]: {format(ratio[-1], '.4e')}")

print(f"\nAverage Pass rate: {round(np.array(pass_rate).mean() * 100, 2)}%", end="")
print(f"Average Solution length: {round(np.array(avg_length).mean(), 2)}", end="")
print(f"Average Runtime: {round(np.array(avg_runtime).mean(), 2)}", end="")
print(f"Average Ratio[(time*len)^-1]: {format(np.array(ratio).mean(), '.4e')}", end="")
