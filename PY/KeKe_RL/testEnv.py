from KeKe_env import KeKeEnv

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

env = KeKeEnv(level1)
init_state = env.reset()

# action = ['up','right','right','up','up','left','left','left','down','down','up','up','right','down','down']
# action = ['down', 'down', 'right', 'right', 'right', 'up', 'left', 'up']
action = ['down', 'space']
for a in action:
    state, reward, done, info = env.step(a)
    env.render()

    # print(state)
    print("reward: %.3f \t done: " % reward, end="")
    print(str(done) + "\n")
