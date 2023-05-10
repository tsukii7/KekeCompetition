import execjs
import gym
from gym import Env
from gym import spaces
import numpy as np
import random
from copy import deepcopy

# from envs.build_problems import *

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


class KeKeEnv(Env):
    def __init__(self, root_map=None):

        with open("../../JS/Keke_JS/js/simulation_new.js",
                  "r") as simjs_file:
            simjs = simjs_file.read()
        self.simjs = execjs.compile(simjs)
        self.action_space = spaces.Discrete(5)
        self.DEFAULT_DISTANCE = 10
        if root_map is None:
            root_map = level1
        self.orig_map = root_map
        self.init_state = self.getInitialState()
        self.current_state = self.init_state


    def step(self, action):
        # new_state = deepcopy(self.current_state)
        state = self.current_state
        om = state['obj_map']
        bm = state['back_map']
        players = state['players']
        pushs = state['pushables']
        phys = state['phys']
        sort_phys = state['sort_phys']
        killers = state['killers']
        sinkers = state['sinkers']
        featured = state['featured']
        baba = self.simjs.call('movePlayers', action, [],self.current_state)[0]
        print('baba: (%d, %d)' % (baba['x'], baba['y']))
        # print('player (' + str(baba['x']+', '+baba['y'])+')')
        # res = self.simjs.call('nextMove', action, self.current_state)
        res = self.simjs.call('stateNextMove', action, self.current_state)
        # res = self.simjs.call('showState', self.current_state)
        # res = self.simjs.call('movePlayers', action, [],self.current_state)
        # print('drowned' + str(self.simjs.call('drowned', phys, sinkers)))
        # print('killed' + str(self.simjs.call('killed', players, killers)))
        # print('badFeats' + str(self.simjs.call('badFeats', featured, sort_phys)))
        # res = self.simjs.call('equals', phys[5], sinkers[0])
        # res = ctx.call('equals', players[0], killers[0])
        new_state = res['next_state']
        done = res['won']

        self.current_state = new_state
        reward = self.getHeuristicScore(self.current_state)

        info = {}
        # if self.render:
        #     self.render()
        return self.current_state, reward, done, info

    def render(self):
        res = self.simjs.call('showState', self.current_state)
        # res = self.simjs.call('doubleMap2Str', self.current_state['obj_map'], self.current_state['back_map'])
        print(res)

    def reset(self):
        self.current_state = self.init_state
        return self.current_state

    def getInitialState(self):
        self.init_state = self.simjs.call("newState", self.orig_map)

        return self.init_state

    def getHeuristicScore(self, state):
        win_d = self.heuristic(state['players'], state['winnables'])
        word_d = self.heuristic(state['players'], state['words'])
        push_d = self.heuristic(state['players'], state['pushables'])
        # return (win_d + word_d + push_d) / 3
        return 3 / (win_d + word_d + push_d)

    def heuristic(self, g1, g2):
        allD = []
        for g in range(len(g1)):
            for h in range(len(g2)):
                d = self.dist(g1[g], g2[h])
                allD.append(d)

        avg = 0
        for i in range(len(allD)):
            avg += allD[i]
        if len(allD) == 0:
            return self.DEFAULT_DISTANCE

        return avg / len(allD)

    def dist(self, a, b):
        return abs(b['x'] - a['x']) + abs(b['y'] - a['y'])
