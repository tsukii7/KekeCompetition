function randomInt(n) {
    return Math.floor(Math.random() * n)
}

// ---------- constants ----------------
const BREAK_MS = 10
const EPSILON = 0.000001
const POINT1_CROSS = 0
const UNIFORM_CROSS = 1
const SOLVE_LIMIT_MS = 10 * 1000
const TIMER_LIMIT_MS = 500

// ---------- parameters of GA ------------
const POPULATION_SIZE = 20
const SIMULATION_DEPTH = 10
const CROSSOVER_TYPE = POINT1_CROSS
const MUTATION = 1
const TOURNAMENT_SIZE = 2
const ELITISM = 6
// 下一代中，保留的上一代精英数量

// ------------- Keke game --------------
const possActions = ["space", "right", "up", "left", "down"]
const N_ACTIONS = possActions.length
let last_solution = []
let has_found = false
const RHEA_BREAK = 500

class Individual {
    constructor(L, nLegalActions) {
        this.actions = []
        this.nLegalActions = nLegalActions
        for (let i = 0; i < L; i++) {
            this.actions.push(possActions[randomInt(nLegalActions)])
        }
        this.fitness = 0
    }

    setActions(new_actions) {
        this.actions = [...new_actions]
    }

    mutate(MUT) {
        const new_instance = this.copy()
        new_instance.setActions(this.actions)

        let count = 0
        if (this.nLegalActions > 1) {
            while (count < MUT) {
                // index of action to mutate
                const index = randomInt(new_instance.actions.length)

                // new action
                const new_action = possActions[randomInt(this.nLegalActions)]

                // mutate
                new_instance.actions[index] = new_action

                count++
            }
        }

        return new_instance
    }

    crossover(parent1, parent2, CROSSOVER_TYPE) {
        if (CROSSOVER_TYPE === POINT1_CROSS) {
            // 1-point
            const p = randomInt(this.actions.length - 3) + 1
            for (let i = 0; i < this.actions.length; i++) {
                if (i < p) {
                    this.actions[i] = parent1.actions[i]
                } else {
                    this.actions[i] = parent2.actions[i]
                }
            }
        } else if (CROSSOVER_TYPE === UNIFORM_CROSS) {
            // uniform
            for (let i = 0; i < this.actions.length; i++) {
                if (Math.random() < 0.5) {
                    this.actions[i] = parent1.actions[i]
                } else {
                    this.actions[i] = parent2.actions[i]
                }
            }
        }
    }

    copy() {
        const new_instance = new Individual(this.actions.length, this.nLegalActions)
        new_instance.fitness = this.fitness
        new_instance.setActions(this.actions)
        return new_instance
    }
}

class Agent {
    constructor() {
        this.population = null
        this.next_pop = null
        this.num_individuals = 0
        this.timer = null

        this.accu_time_taken_eval = 0
        this.ave_time_taken_eval = 0
        this.avg_time_taken = 0
        this.accum_time_taken = 0
        this.num_evals = 0
        this.num_iters = 0
        this.keep_iterating = true
        this.remaining = 0
    }

    act(current_node, init_state) {
        this.timer = new ElapsedCpuTimer()
        this.avg_time_taken = 0
        this.accum_time_taken = 0
        this.num_evals = 0
        this.accu_time_taken_eval = 0
        this.num_iters = 0
        this.num_individuals = 0
        this.keep_iterating = true
        this.remaining = this.timer.remainingTimeMillis()

        this.init_pop(current_node, init_state)
        if (has_found)
            return

        this.remaining = this.timer.remainingTimeMillis()
        while (this.remaining > this.avg_time_taken && this.remaining > BREAK_MS && this.keep_iterating) {
            this.runIteration(current_node, init_state)
            if (has_found) return
            this.remaining = this.timer.remainingTimeMillis()
        }

        return this.getBestAction(this.population)
    }

    /** 进行交叉变异，产生下一代，并将下一代放入 this.population 变量中 */
    runIteration(current_node, init_state) {
        const elapsed_timer_iteration = new ElapsedCpuTimer()


        for (let i = ELITISM; i < this.num_individuals; i++) {
            // for (let i = 0; i < ELITISM; i++) {
            // 此处修改：
            // 原本：前 0 - ELITISM 个交叉产生新个体，剩余不变。但是前面的都是fitness很高的个体，不应改变
            // 现在：前 0 - ELITISM 保持不变，后面个体改为交叉产生的新个体

            if (this.remaining > 2 * this.ave_time_taken_eval && this.remaining > BREAK_MS) {
                let new_individual = this.crossover()
                new_individual = new_individual.mutate(MUTATION)

                this.evaluate(new_individual, current_node, init_state)
                if (has_found)
                    return

                this.next_pop[i] = new_individual.copy()

                this.remaining = this.timer.remainingTimeMillis()
            } else {
                this.keep_iterating = false
                break
            }
        }

        this.next_pop.sort((a, b) => b.fitness - a.fitness)
        this.population = [...this.next_pop]

        this.num_iters++
        this.accum_time_taken += elapsed_timer_iteration.elapsedMillis()
        this.avg_time_taken = this.accum_time_taken / this.num_iters
    }

    crossover() {
        let new_individual = null
        if (this.num_individuals > 1) {
            new_individual = new Individual(SIMULATION_DEPTH, N_ACTIONS)
            const tournament = []
            const list = [...this.population]

            for (let i = 0; i < TOURNAMENT_SIZE; i++) {
                const index = randomInt(list.length)
                tournament.push(list[index])
                list.splice(index, 1)
            }
            tournament.sort((a, b) => b.fitness - a.fitness)

            // get best two to be parents
            if (TOURNAMENT_SIZE >= 2) {
                new_individual.crossover(tournament[0], tournament[1], CROSSOVER_TYPE)
            } else {
                console.log("TOURNAMENT_SIZE < 2")
            }
        }
        return new_individual
    }

    init_pop(node, init_state) {
        let remaining = this.timer.remainingTimeMillis()

        this.population = new Array(POPULATION_SIZE)
        this.next_pop = new Array(POPULATION_SIZE)

        for (let i = 0; i < POPULATION_SIZE; i++) {
            if (i === 0 || remaining > this.ave_time_taken_eval && remaining > BREAK_MS) {
                this.population[i] = new Individual(SIMULATION_DEPTH, N_ACTIONS)

                this.evaluate(this.population[i], node, init_state)
                if (has_found)
                    return

                remaining = this.timer.remainingTimeMillis()
                this.num_individuals = i + 1
            } else {
                break
            }
        }

        if (this.num_individuals > 1) {
            this.population.sort((a, b) => b.fitness - a.fitness)
        }
        for (let i = 0; i < this.num_individuals; i++) {
            if (this.population[i] !== undefined && this.population[i] !== null) {
                this.next_pop[i] = this.population[i].copy()
            }
        }
    }

    getBestAction(pop) {
        return pop[0].actions[0]
    }

    evaluate(individual, node, init_state) {
        const elapsed_timer_iteration_eval = new ElapsedCpuTimer()
        let accum = 0
        let avg = 0

        let current_node = node
        let fitness = 0
        for (let i = 0; i < SIMULATION_DEPTH; i++) {
            if (!current_node.win) {
                const elapsed_timer_iteration = new ElapsedCpuTimer()
                let n_kk_p = {};
                newstate(n_kk_p, init_state['orig_map'])
                const temp = getNextState(individual.actions[i], n_kk_p, current_node.actionSet)
                fitness = temp[0]
                current_node = temp[1]

                accum += elapsed_timer_iteration.elapsedMillis()
                avg = accum / (i + 1)
                this.remaining = this.timer.remainingTimeMillis()
                if (this.remaining < 2 * avg || this.remaining < BREAK_MS) {
                    break
                }
            } else {
                last_solution = current_node.actionSet
                has_found = true
                console.log('evaluate: ' + current_node.actionSet)
                return
            }
        }

        individual.fitness = fitness

        this.num_evals++
        this.accu_time_taken_eval += elapsed_timer_iteration_eval.elapsed()
        this.ave_time_taken_eval = this.accu_time_taken_eval / this.num_evals
        this.remaining = this.timer.remainingTimeMillis()

        return individual.fitness
    }
}

class ElapsedCpuTimer {
    constructor(max_time = TIMER_LIMIT_MS) {
        this.bean = global.performance;
        this.old_time = this.getTime();
        this.max_time = max_time;
    }

    remainingTimeMillis() {
        const diff = this.max_time - this.elapsed();
        return Math.round(diff);
    }

    elapsed() {
        return this.getTime() - this.old_time;
    }

    elapsedMillis() {
        return this.elapsed()
    }

    getTime() {
        return this.bean.now() // 毫秒
    }

}


// -------------- Keke AI Part ------------------

var simjs = require('../js/simulation')
const {nextMove} = require("../js/simulation");
const {read} = require("fs");

function Node(mapRep, actionSet, win, died) {
    this.mapRep = mapRep;
    this.actionSet = actionSet;
    this.win = win;
    this.died = died;
}


function newstate(keke_state, m) {
    simjs.clearLevel(keke_state);

    keke_state['orig_map'] = m;

    var maps = simjs.splitMap(keke_state['orig_map']);
    keke_state['back_map'] = maps[0]
    keke_state['obj_map'] = maps[1];

    simjs.assignMapObjs(keke_state);
    simjs.interpretRules(keke_state);
}

function getNextState(dir, state, previous_actions) {
    //get the action space from the parent + new action
    let newActions = [...previous_actions]
    newActions.push(dir);

    //move the along the action space
    let didwin = false
    for (let a = 0; a < newActions.length; a++) {
        let res = simjs.nextMove(newActions[a], state);
        state = res['next_state'];
        didwin = res['won'];

        //everyone died
        if (state['players'].length === 0) {
            didwin = false;
            break;
        }

    }

    //return distance from nearest goal for priority queue purposes
    let win_d = heuristic2(state['players'], state['winnables']);
    let word_d = heuristic2(state['players'], state['words']);
    let push_d = heuristic2(state['players'], state['pushables']);

    return [
        (win_d + word_d + push_d) / 3,
        new Node(simjs.doubleMap2Str(state.obj_map, state.back_map),
            newActions,
            didwin,
            (state['players'].length === 0))
    ]
}

// FIND AVERAGE DISTANCE OF GROUP THAT IS CLOSEST TO ANOTHER OBJECT IN A DIFFERENT GROUP
function heuristic2(g1, g2) {
    let allD = [];
    for (let g = 0; g < g1.length; g++) {
        for (let h = 0; h < g2.length; h++) {
            let d = dist(g1[g], g2[h]);
            allD.push(d);
        }
    }

    let avg = 0;
    for (let i = 0; i < allD.length; i++) {
        avg += allD[i];
    }
    return avg / allD.length;
}

function dist(a, b) {
    return (Math.abs(b.x - a.x) + Math.abs(b.y - a.y));
}

// let current_state = null
// let current_node = null
// let initial_state = null
// let initial_node = null
let solve_timer = null
let remaining = 0
let agent


function iterSolve(init_state) {
    let current_state = {}
    newstate(current_state, init_state['orig_map'])
    let current_node = new Node(simjs.map2Str(init_state['orig_map']), [], false, false)

    remaining = solve_timer.remainingTimeMillis()
    const result = []

    while (remaining > RHEA_BREAK) {
        // if (has_found) {
        //     console.log('iterSolve: ' + last_solution)
        // }

        const new_action = agent.act(current_node, init_state)
        if (has_found) {
            console.log('\n')
            return last_solution
        }
        result.push(new_action)

        const res = simjs.nextMove(new_action, current_state)
        current_state = res['next_state']
        let didwin = res['won'];
        //everyone died
        if (current_state['players'].length === 0) {
            didwin = false;
        }

        current_node = new Node(
            simjs.doubleMap2Str(current_state.obj_map, current_state.back_map),
            [...result],
            didwin,
            current_state['players'].length === 0)

        if (current_node.died) {
            last_solution = result
            return []
        }
        if (current_node.win) {
            return result
        }

        remaining = solve_timer.remainingTimeMillis()
    }

    return result
}

module.exports = {
    step: function (init_state) {
        return iterSolve(init_state)
    },
    init: function (init_state) {
        // initial_state = {}
        // newstate(initial_state.copy(), init_state['orig_map'])
        // initial_node = new Node(simjs.map2Str(init_state['orig_map']), [], false, false)
        solve_timer = new ElapsedCpuTimer(SOLVE_LIMIT_MS)
        agent = new Agent()
        has_found = false
        last_solution = []
    },
    best_sol: function () {
        console.log('best_sol: ' + last_solution + '\n')
        return last_solution
    }
}