
# map_key = None
# map_char = None

map_char = {"border": '_', "empty": '.', "baba_phys": 'b', "baba_word": 'B', "is_word": '1', "you_word": '2',
            "win_word": '3', "skull_phys": 's', "skull_word": 'S', "flag_phys": 'f', "flag_word": 'F',
            "floor_phys": 'o', "floor_word": 'O', "grass_phys": 'a', "grass_word": 'A', "kill_word": '4',
            "lava_phys": 'l', "lava_word": 'L', "push_word": '5', "rock_phys": 'r', "rock_word": 'R',
            "stop_word": '6', "wall_phys": 'w', "wall_word": 'W', "move_word": '7', "hot_word": '8',
            "melt_word": '9', "keke_phys": 'k', "keke_word": 'K', "goop_phys": 'g', "goop_word": 'G',
            "sink_word": '0', "love_phys": 'v', "love_word": 'V'}
map_char = map_char
map_key = {
    '_': 0,  # border
    ' ': 1,  # empty
    '.': 1,  # empty
    'b': 2,  # baba_phys
    'B': 3,  # baba_word
    '1': 4,  # is_word
    '2': 5,  # you_word
    '3': 6,  # win_word
    's': 7,  # skull_phys
    'S': 8,  # skull_word
    'f': 9,  # flag_phys
    'F': 10,  # flag_word
    'o': 11,  # floor_phys
    'O': 12,  # floor_word
    'a': 13,  # grass_phys
    'A': 14,  # grass_word
    '4': 15,  # kill_word
    'l': 16,  # lava_phys
    'L': 17,  # lava_word
    '5': 18,  # push_word
    'r': 19,  # rock_phys
    'R': 20,  # rock_word
    '6': 21,  # stop_word
    'w': 22,  # wall_phys
    'W': 23,  # wall_word
    '7': 24,  # move_word
    '8': 25,  # hot_word
    '9': 26,  # melt_word
    'k': 27,  # keke_phys
    'K': 28,  # keke_word
    'g': 29,  # goop_phys
    'G': 30,  # goop_word
    '0': 31,  # sink_word
    'v': 32,  # love_phys
    'V': 33  # love_word
}


def asciiToArray(input_str):
    # input_str = "__________\n_.....B12_\n_.W......_\n_.1wwwww._\n_.6wf..w._\n_..w..kw._\n_F.wwwww._\n_1......._\n_3...bK17_\n__________"

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


def encodeMap(obj_map, back_map):
    state = [[[0] * 20] * 20] * len(map_key)
    for i in range(len(obj_map)):
        for j in range(len(obj_map[i])):
            if type(obj_map[i][j]) == str:
                idx = map_key[obj_map[i][j]]
            else:
                name = obj_map[i][j]['name'] + "_" + obj_map[i][j]['type']
                char = map_char[name]
                idx = map_key[char]
            state[idx][i][j] = 1

    for i in range(len(back_map)):
        for j in range(len(back_map[i])):
            if type(back_map[i][j]) == str:
                idx = map_key[back_map[i][j]]
            else:
                name = back_map[i][j]['name']  + "_" + back_map[i][j]['type']
                char = map_char[name]
                idx = map_key[char]
            state[idx][i][j] = 1

    return state
