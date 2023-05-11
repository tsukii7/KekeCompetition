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
        baba = self.simjs.call('movePlayers', action, [], self.current_state)[0]
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

    def getMyHeuristicScore(self, pre_state, next_state):
        def get_exp_score(arr1, arr2, initial_weight, decrease_speed):
            dists = []
            for i in arr1:
                for j in arr2:
                    dists.append(self.dist(i, j))
            dists.sort()
            res = 0
            weight = initial_weight
            for dist in dists:
                res += dist * weight
                weight *= decrease_speed
            return res

        def get_rule_score(pre_rules, next_rules, weight_add, weight_minus):
            only_pre = list(set(pre_rules)).difference(set(next_rules))
            only_next = list(set(next_rules).difference(set(pre_rules)))
            return weight_add * only_next - weight_minus * only_pre

        pre_players = pre_state['players']
        pre_pushables = pre_state['pushables']
        pre_killers = pre_state['killers']
        pre_sinkers = pre_state['sinkers']
        pre_rules = pre_state['rules']
        pre_winnables = pre_state['winnables']
        pre_words = pre_state['words']

        next_players = next_state['players']
        next_pushables = next_state['pushables']
        next_killers = next_state['killers']
        next_sinkers = next_state['sinkers']
        next_rules = next_state['rules']
        next_winnables = next_state['winnables']
        next_words = next_state['words']

        weight_players = 5
        score_players = (len(next_players) - len(pre_players)) * weight_players

        weight_pushables = 5
        score_pushables = (len(next_pushables) - len(pre_pushables)) * weight_pushables

        weight_killers = 5
        decrease_killers = 0.8
        score_killers_players = get_exp_score(next_players, next_killers, weight_killers, decrease_killers) - \
                                get_exp_score(pre_players, pre_killers, weight_killers, decrease_killers)

        weight_sinkers_players = 1
        decrease_sinkers_players = 0.9
        score_sinkers_players = get_exp_score(next_players, next_sinkers, weight_sinkers_players,
                                              decrease_sinkers_players) - \
                                get_exp_score(pre_players, pre_sinkers, weight_sinkers_players,
                                              decrease_sinkers_players)
        weight_sinkers_pushables = -3
        decrease_sinkers_pushables = 0.9
        score_sinkers_pushables = get_exp_score(next_pushables, next_sinkers, weight_sinkers_pushables,
                                                decrease_sinkers_pushables) - \
                                  get_exp_score(pre_pushables, pre_sinkers, weight_sinkers_pushables,
                                                decrease_sinkers_pushables)
        score_sinkers = score_sinkers_players + score_sinkers_pushables

        weight_add = 3
        weight_minus = 3
        score_rules = get_rule_score(pre_rules, next_rules, weight_add, weight_minus)

        weight_winnables = -5
        decrease_winnables = 0.9
        score_winnables = get_exp_score(next_players, next_winnables, weight_winnables, decrease_winnables) - \
                          get_exp_score(pre_players, pre_winnables, weight_winnables, decrease_winnables)

        weight_words = -5
        decrease_words = 0.9
        score_words = get_exp_score(next_players, next_words, weight_words, decrease_words) - \
                      get_exp_score(pre_players, pre_words, weight_words, decrease_words)

        ans = score_players + score_pushables + score_killers_players + score_sinkers + score_rules + score_winnables + score_words
        return ans

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
