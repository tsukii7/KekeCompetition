# from gym import envs
# import KeKe_env
#
# envids = [spec.id for spec in envs.registry.all()]
# for envid in sorted(envids):
#     print(envid)

import gym

env = gym.make('KeKe-v0')
env.reset()
env.render()
