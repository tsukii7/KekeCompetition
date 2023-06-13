import execjs
# import gym
# from gym import Env
# from gym import spaces
import gymnasium as gymnasium
from gymnasium import Env
from gymnasium import spaces

import numpy as np
import random
from copy import deepcopy

from . import Util
import time

DIFFICULTY = 1
count = None
start_time = None

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
level19 = [
    ['_', '_', '_', '_', '_', '_', '_', '_', '_', '_'],
    ['_', ' ', ' ', ' ', ' ', ' ', 'B', '1', '2', '_'],
    ['_', ' ', 'W', ' ', ' ', ' ', ' ', ' ', ' ', '_'],
    ['_', ' ', '1', 'w', 'w', 'w', 'w', 'w', ' ', '_'],
    ['_', ' ', '6', 'w', 'f', ' ', ' ', 'w', ' ', '_'],
    ['_', ' ', ' ', 'w', ' ', ' ', 'k', 'w', ' ', '_'],
    ['_', 'F', ' ', 'w', 'w', 'w', 'w', 'w', ' ', '_'],
    ['_', '1', ' ', ' ', ' ', ' ', ' ', ' ', ' ', '_'],
    ['_', '3', ' ', ' ', ' ', 'b', 'K', '1', '7', '_'],
    ['_', '_', '_', '_', '_', '_', '_', '_', '_', '_']
]

'''
map_key['_'] = "border";
map_key[' '] = "empty";
//map_key['.'] = "empty";
map_key['b'] = "baba_obj";
map_key['B'] = "baba_word";
map_key['1'] = "is_word";
map_key['2'] = "you_word";
map_key['3'] = "win_word";
map_key['s'] = "skull_obj";
map_key['S'] = "skull_word";
map_key['f'] = "flag_obj";
map_key['F'] = "flag_word";
map_key['o'] = "floor_obj";
map_key['O'] = "floor_word";
map_key['a'] = "grass_obj";
map_key['A'] = "grass_word";
map_key['4'] = "kill_word";
map_key['l'] = "lava_obj";
map_key['L'] = "lava_word";
map_key['5'] = "push_word";
map_key['r'] = "rock_obj";
map_key['R'] = "rock_word";
map_key['6'] = "stop_word";
map_key['w'] = "wall_obj";
map_key['W'] = "wall_word";
map_key['7'] = "move_word";
map_key['8'] = "hot_word";
map_key['9'] = "melt_word";
map_key['k'] = "keke_obj";
map_key['K'] = "keke_word";
map_key['g'] = "goop_obj";
map_key['G'] = "goop_word";
map_key['0'] = "sink_word";
map_key['v'] = "love_obj";
map_key['V'] = "love_word";
'''


def progress_bar(finish_tasks_number, tasks_number, complete_time):
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
    print("\r{:.2f}% [{}{}{}] {:.2f}s".format(percentage, finished_label, arrow, unfinished_label, complete_time),
          end="")


class KeKeEnv(Env):

    def initMapKey(self):
        self.map_key = {
            '_': 0,  # border
            ' ': 1,  # empty
            '.': 1,  # empty
            'b': 2,  # baba_obj
            'B': 3,  # baba_word
            '1': 4,  # is_word
            '2': 5,  # you_word
            '3': 6,  # win_word
            's': 7,  # skull_obj
            'S': 8,  # skull_word
            'f': 9,  # flag_obj
            'F': 10,  # flag_word
            'o': 11,  # floor_obj
            'O': 12,  # floor_word
            'a': 13,  # grass_obj
            'A': 14,  # grass_word
            '4': 15,  # kill_word
            'l': 16,  # lava_obj
            'L': 17,  # lava_word
            '5': 18,  # push_word
            'r': 19,  # rock_obj
            'R': 20,  # rock_word
            '6': 21,  # stop_word
            'w': 22,  # wall_obj
            'W': 23,  # wall_word
            '7': 24,  # move_word
            '8': 25,  # hot_word
            '9': 26,  # melt_word
            'k': 27,  # keke_obj
            'K': 28,  # keke_word
            'g': 29,  # goop_obj
            'G': 30,  # goop_word
            '0': 31,  # sink_word
            'v': 32,  # love_obj
            'V': 33  # love_word
        }

    def __init__(self, root_map=None):
        super().__init__()
        self.truncated = False
        self.initMapKey()

        with open("../../JS/Keke_JS/js/simulation_new.js",
                  "r") as simjs_file:
            simjs = simjs_file.read()
        self.simjs = execjs.compile(simjs)
        self.action_space = gymnasium.spaces.Discrete(5)  # up, down, left, right, space
        # We assume a maximum grid size of 20x20 for simplicity
        self.observation_space = spaces.Box(low=0, high=1, shape=(len(self.map_key), 20, 20), dtype=int)

        self.DEFAULT_DISTANCE = 10
        # if root_map is None:
        # root_map = level15
        Util.initialize_maps('./json_levels/new_full_biy_LEVELS.json')
        root_map = Util.get_map(DIFFICULTY)
        self.orig_map = root_map
        self.init_state = self.getInitialState()
        self.current_state = self.init_state

        global count, start_time
        count = 0
        start_time = time.time()

    def step(self, action):
        if time.time() - self.start > 10:
            self.truncated = True
        # new_state = deepcopy(self.current_state)
        action = ["up", "down", "left", "right", "space"][action]
        state = self.current_state
        # om = state['obj_map']
        # bm = state['back_map']
        # players = state['players']
        # pushs = state['pushables']
        # phys = state['phys']
        # sort_phys = state['sort_phys']
        # killers = state['killers']
        # sinkers = state['sinkers']
        # featured = state['featured']
        # baba = self.simjs.call('movePlayers', action, [], self.current_state)

        # print('player (' + str(baba['x']+', '+baba['y'])+')')
        # res = self.simjs.call('map2State', self.current_state['orig_map'], self.current_state['obj_map'], self.current_state['back_map'])
        res = self.simjs.call('stateNextMove', action, self.current_state)
        new_state = res['next_state']
        player = new_state['players']

        # global count, start_time
        # if count < 26624:
        #     count += 1
        #     # progress_bar(count, 26624, time.time() - start_time)
        # else:
        #     print("player: ", end="")
        #     for p in player:
        #         print('(%d, %d)' % (p['x'], p['y']), end=" ")
        #     print()

        done = res['won'] or len(player) == 0

        reward = -1
        if res['won']:
            reward = 10000
            # print("\nwin")
        elif len(new_state['players']) == 0:
            reward = -10000
            # print("\nlose")
        else:
            reward = self.getMyHeuristicScore(state, new_state)
            # reward = self.getHeuristicScore(new_state)
        self.current_state = new_state
        self.observation_state = self.stateToObservation()

        info = {}
        return self.observation_state, reward, done, self.truncated, info

    def stateToObservation(self):
        # ascii_map = self.simjs.call('showState', self.current_state)
        state = self.current_state
        observation_state = Util.encodeMap(state['obj_map'], state['back_map'])

        # map_key = self.map_key
        # ascii_list = ascii_map.strip().split('\n')
        # observation_state = []
        # for row in ascii_list:
        #     output_row = []
        #     for char in row:
        #         if char in map_key:
        #             output_row.append(map_key[char])
        #         else:
        #             output_row.append(1)
        #     observation_state.append(output_row)

        return observation_state

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
                res += weight / (dist + 1)
                weight *= decrease_speed
            return res

        def get_rule_score(pre_rules, next_rules, weight_add, weight_minus):
            only_pre = list(set(pre_rules).difference(set(next_rules)))
            only_next = list(set(next_rules).difference(set(pre_rules)))
            return weight_add * len(only_next) - weight_minus * len(only_pre)

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

        weight_players = 1
        score_players = (len(next_players) - len(pre_players)) * weight_players

        weight_pushables = 1
        score_pushables = (len(next_pushables) - len(pre_pushables)) * weight_pushables

        weight_killers = 2.5
        decrease_killers = 0.85
        score_killers = get_exp_score(next_players, next_killers, weight_killers, decrease_killers) - \
                        get_exp_score(pre_players, pre_killers, weight_killers, decrease_killers)

        weight_sinkers_players = 2.5
        decrease_sinkers_players = 0.85
        score_sinkers_players = get_exp_score(next_players, next_sinkers, weight_sinkers_players,
                                              decrease_sinkers_players) - \
                                get_exp_score(pre_players, pre_sinkers, weight_sinkers_players,
                                              decrease_sinkers_players)
        weight_sinkers_pushables = -3
        decrease_sinkers_pushables = 0.85
        score_sinkers_pushables = get_exp_score(next_pushables, next_sinkers, weight_sinkers_pushables,
                                                decrease_sinkers_pushables) - \
                                  get_exp_score(pre_pushables, pre_sinkers, weight_sinkers_pushables,
                                                decrease_sinkers_pushables)
        score_sinkers = score_sinkers_players + score_sinkers_pushables

        weight_add = 3
        weight_minus = 2
        score_rules = get_rule_score(pre_rules, next_rules, weight_add, weight_minus)

        weight_winnables = -5
        decrease_winnables = 0.9
        score_winnables = get_exp_score(next_players, next_winnables, weight_winnables, decrease_winnables) - \
                          get_exp_score(pre_players, pre_winnables, weight_winnables, decrease_winnables)

        weight_words = -1
        decrease_words = 0.8
        score_words = get_exp_score(next_players, next_words, weight_words, decrease_words) - \
                      get_exp_score(pre_players, pre_words, weight_words, decrease_words)

        ans = score_players + score_pushables + score_killers + score_sinkers + score_rules + score_winnables + score_words
        # print(f"score_players={score_players}")
        # print(f"score_pushables={score_pushables}")
        # print(f"score_killers_players={score_killers}")
        # print(f"score_sinkers={score_sinkers}")
        # print(f"score_rules={score_rules}")
        # print(f"score_winnables={score_winnables}")
        # print(f"score_words={score_words}")
        return ans + 10

    def print_map(self, map_arr):
        for row in map_arr:
            print(' '.join(row))

    def render(self, mode='human', close=False):
        res = self.simjs.call('showState', self.current_state)
        # res = self.simjs.call('doubleMap2Str', self.current_state['obj_map'], self.current_state['back_map'])
        self.print_map(Util.asciiToArray(res))
        return res

    def reset(self, seed=None):
        self.start = time.time()
        # self.orig_map = Util.get_map(DIFFICULTY)
        self.orig_map = Util.asciiToArray(
            '__________\n_.B.F...._\n_.1.1...._\n_.2b3...._\n_........_\n_....r..._\n_.R......_\n_........_\n_........_\n__________')
        self.init_state = self.getInitialState()
        self.current_state = self.init_state
        self.observation_state = self.stateToObservation()
        self.truncated = False
        return self.observation_state, {}

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
