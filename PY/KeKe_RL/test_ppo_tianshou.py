import argparse

import gymnasium as gym
import torch
from tianshou.data import Collector
from tianshou.env import DummyVectorEnv
from tianshou.policy import PPOPolicy
from tianshou.utils.net.common import ActorCritic, DataParallelNet, Net
from tianshou.utils.net.discrete import Actor, Critic


def get_args():
    parser = argparse.ArgumentParser()
    # parser.add_argument('--task', type=str, default='CartPole-v1')
    parser.add_argument('--task', type=str, default='KeKe-v0')
    parser.add_argument('--reward-threshold', type=float, default=950)
    parser.add_argument('--seed', type=int, default=1626)
    parser.add_argument('--buffer-size', type=int, default=20000)
    parser.add_argument('--lr', type=float, default=3e-4)
    parser.add_argument('--gamma', type=float, default=0.99)
    parser.add_argument('--epoch', type=int, default=5)
    parser.add_argument('--step-per-epoch', type=int, default=1000)
    # parser.add_argument('--step-per-epoch', type=int, default=10000)
    parser.add_argument('--step-per-collect', type=int, default=200)
    # parser.add_argument('--step-per-collect', type=int, default=1000)
    parser.add_argument('--repeat-per-collect', type=int, default=10)
    parser.add_argument('--batch-size', type=int, default=64)
    parser.add_argument('--hidden-sizes', type=int, nargs='*', default=[64, 64])
    parser.add_argument('--training-num', type=int, default=20)
    parser.add_argument('--test-num', type=int, default=100)
    parser.add_argument('--logdir', type=str, default='log')
    parser.add_argument('--render', type=float, default=0.)
    # parser.add_argument('--render', type=float, default=0.)
    parser.add_argument(
        '--device', type=str, default='cuda' if torch.cuda.is_available() else 'cpu'
    )
    # ppo special
    parser.add_argument('--vf-coef', type=float, default=0.5)
    parser.add_argument('--ent-coef', type=float, default=0.0)
    parser.add_argument('--eps-clip', type=float, default=0.2)
    parser.add_argument('--max-grad-norm', type=float, default=0.5)
    parser.add_argument('--gae-lambda', type=float, default=0.95)
    parser.add_argument('--rew-norm', type=int, default=0)
    parser.add_argument('--norm-adv', type=int, default=0)
    parser.add_argument('--recompute-adv', type=int, default=0)
    parser.add_argument('--dual-clip', type=float, default=None)
    parser.add_argument('--value-clip', type=int, default=0)
    args = parser.parse_known_args()[0]
    return args


def test_model(args=get_args()):
    # 创建环境
    env = gym.make(args.task)
    args.state_shape = env.observation_space.shape or env.observation_space.n
    args.action_shape = env.action_space.shape or env.action_space.n

    # 创建网络结构
    net = Net(args.state_shape, hidden_sizes=args.hidden_sizes, device=args.device)

    if torch.cuda.is_available():
        actor = DataParallelNet(Actor(net, args.action_shape, device=None).to(args.device))
        critic = DataParallelNet(Critic(net, device=None).to(args.device))
    else:
        actor = Actor(net, args.action_shape, device=args.device).to(args.device)
        critic = Critic(net, device=args.device).to(args.device)

    actor_critic = ActorCritic(actor, critic)

    # 创建策略
    dist = torch.distributions.Categorical
    policy = PPOPolicy(
        actor,
        critic,
        None,  # optim is not required for testing
        dist,
        discount_factor=args.gamma,
        action_space=env.action_space,
        deterministic_eval=True
    )

    # 加载预训练的模型
    policy.load_state_dict(torch.load('log/KeKe-v0/ppo/policy_diff_all.pth'))

    # 创建收集器
    test_envs = DummyVectorEnv([lambda: gym.make(args.task) for _ in range(args.test_num)])
    collector = Collector(policy, test_envs)

    # 收集测试结果
    result = collector.collect(n_episode=100, render=0.0)

    rews, lens = result["rews"], result["lens"]
    print(f"Final reward: {rews.mean()}, length: {lens.mean()}")


if __name__ == '__main__':
    test_model()