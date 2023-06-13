import time

from stable_baselines3 import PPO
from stable_baselines3.common.vec_env import DummyVecEnv
import gym

# 加载你的环境
env = gym.make('KeKe-v0')

# Stable Baselines3 的 PPO 算法需要一个向量化的环境。这里我们使用 DummyVecEnv 作为向量化环境的简单版本。
env = DummyVecEnv([lambda: env])

# 创建一个PPO模型
model = PPO("MlpPolicy", env, verbose=1)

# 训练模型
# model.learn(total_timesteps=25000)

# 保存模型
# model.save("ppo_baba_is_you_originF.model")

print("=====================Training Finished=====================")

# 加载模型并在环境中运行
model = PPO.load("model/ppo_baba_is_you_originF.model")

obs = env.reset()
action_history = []
start = time.time()
for i in range(10000):
    action = env.action_space.sample()
    action_history.append(["up", "down", "left", "right", "space"][action])
    obs, rewards, dones, info = env.step([action])
    # env.render()

    print("reward: %.3f \t done: " % rewards, end="")
    print(str(dones) + "\n")

    if dones:
        break

print("Total steps: %d" % len(action_history))
print(action_history)
end = time.time()
print("Time elapsed: %.3f" % (end - start))