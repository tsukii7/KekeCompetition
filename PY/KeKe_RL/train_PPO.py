import gym
from stable_baselines3 import PPO
from stable_baselines3.common.vec_env.dummy_vec_env import DummyVecEnv
from KeKe_env import KeKeEnv

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

# env_name = "KeKeEnv"
# env = gym.make(env_name)
# env = DummyVecEnv([lambda : env])

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
            tensorboard_log="./tensorboard/LunarLander-v2/"
)

model.learn(total_timesteps=1e6)

model.save("./model/LunarLander_PPO.pkl")

model = PPO.load("./model/LunarLander_PPO.pkl")

state = env.reset()
done = False
score = 0
while not done:
    action, _ = model.predict(observation=state)
    state, reward, done, info = env.step(action=action)
    score += reward
    env.render()
env.close()
