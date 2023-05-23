import numpy as np


class Utils:
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

    def asciiToArray(self, input_str):
        input_str = "__________\n_.....B12_\n_.W......_\n_.1wwwww._\n_.6wf..w._\n_..w..kw._\n_F.wwwww._\n_1......._\n_3...bK17_\n__________"

        rows = input_str.split('\n')
        result = []
        for row in rows:
            row = list(row)
            for i in range(len(row)):
                if row[i] == '.':
                    row[i] = ' '
            chars = list(row)
            result.append(chars)

        print(result)
        return result

    def encodeMap(self, obj_map, back_map):
        state = np.zeros(20, 20) * len(self.map_key)
        for i in range(len(obj_map)):
            for j in range(len(obj_map[i])):
                idx = self.map_key[obj_map[i][j]]
                state[idx][i][j] = 1

        for i in range(len(back_map)):
            for j in range(len(back_map[i])):
                idx = self.map_key[back_map[i][j]]
                state[idx][i][j] = 1

        return state
