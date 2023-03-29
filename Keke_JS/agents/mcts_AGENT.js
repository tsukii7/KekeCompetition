// BABA IS Y'ALL SOLVER - BLANK TEMPLATE
// Version 1.0
// Code by Milk 


//get imports (NODEJS)
// Outline:
// initAgent() -> iterSolve(){ queue.shift() stateSet.push() queue.push() queue.sort() } ->
// MCTS_run() { root.mctsSearch() root.bestAction() } -> action

// todo: implement a timer to stop the search after a certain amount of time

var simjs = require('../js/simulation');					//access the game states and simulation

let MCTS_ITERATIONS = 5;
let possActions = ["space", "right", "up", "left", "down"];

// let stateSet = [];
let curIteration = 0;
// let queue = [];
let mctsAgent = null;
let currentNode = null;

function newState(kekeState, map) {
    simjs.clearLevel(kekeState);
    kekeState.orig_map = map;
    [kekeState.back_map, kekeState.obj_map] = simjs.splitMap(kekeState.orig_map);
    simjs.assignMapObjs(kekeState);
    simjs.interpretRules(kekeState);
}


function initAgent(init_state) {
    // mctsAgent = new SingleMCTSPlayer(possActions);
    curIteration = 0;
    stateSet = [];
    this.m_root = new SingleTreeNode(simjs.map2Str(initState.orig_map), [], null, false, false);
    queue = [[0, master_node]];
}

// NEXT ITERATION STEP FOR SOLVING
function iterSolve(init_state) {
    // PERFORM ITERATIVE CALCULATIONS HERE //
    if (queue.length < 1)
        return [];

    //pop the next node off the queue and get its children
    let curnode = queue.shift()[1];
    children = getChildren(init_state['orig_map'], curnode);

    //check if golden child was found
    for (let c = 0; c < children.length; c++) {
        stateSet.push(children[c][1].mapRep);
        //console.log(children[c].mapRep);
        if (children[c][1].win) {
            //console.log(children[c][1].actionSet);
            return children[c][1].actionSet;
        }
    }

    //otherwise add to the list and sort it for priority
    queue.push.apply(queue, children);
    queue.sort();
    curIteration++;

    //return a sequence of actions or empty list
    return [];
}

// class SingleMCTSPlayer {
//     constructor(possActions) {
//         this.actions = possActions;
//         this.num_actions = possActions.length;
//     }

// function init(gameState) {
//     this.m_root = new SingleTreeNode(simjs.map2Str(initState.orig_map), [], null, false, false);
// }

// RETURNS AN ASCII REPRESENTATION OF THE MAP STATE AFTER AN ACTION IS TAKEN
function getNextState(dir, state, parent) {
    //get the action space from the parent + new action
    let newActions = [];
    newActions.push.apply(newActions, parent.actionSet);
    newActions.push(dir);

    //console.log("before KEKE (" + newActions + "): \n" + simjs.doubleMap2Str(state.obj_map, state.back_map))

    //move the along the action space
    let didwin = false;
    for (let a = 0; a < newActions.length; a++) {
        let res = simjs.nextMove(newActions[a], state);
        state = res['next_state'];
        didwin = res['won'];

        //everyone died
        if (state['players'].length == 0) {
            didwin = false;
            break;
        }

    }

    //return distance from nearest goal for priority queue purposes
    let win_d = heuristic2(state['players'], state['winnables']);
    let word_d = heuristic2(state['players'], state['words']);
    let push_d = heuristic2(state['players'], state['pushables']);
    //console.log(d);
    //console.log("after KEKE (" + newActions + "): \n" + simjs.doubleMap2Str(state.obj_map, state.back_map));


    return [(win_d + word_d + push_d) / 3, new node(simjs.doubleMap2Str(state.obj_map, state.back_map), newActions, parent, didwin, (state['players'].length == 0))]
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

// BASIC EUCLIDEAN DISTANCE FUNCTION FROM OBJECT A TO OBJECT B
function dist(a, b) {
    return (Math.abs(b.x - a.x) + Math.abs(b.y - a.y));
}

function run() {
    this.m_root.mctsSearch();

    let action = this.m_root.bestAction();
    // let action = this.m_root.mostVisitedAction();

    return action;
}

// }

// class SingleTreeNode {
//     constructor(m, a, p, w, d) {
//         this.mapRep = m;
//         this.actionHistory = a;
//         this.parent = p;
//         this.won = w;
//         this.died = d;
//         this.toValue = 0;
//         this.m_depth = 0;
//
//         if (parent != null)
//             this.m_depth = parent.m_depth + 1;
//         else
//             this.m_depth = 0;
//     }
//
//     // TODO: timer & avgTimeTaken
//     mctsSearch() {
//         let numIters = 0;
//
//     }
//
// }

function SingleTreeNode(m, a, p, w, d) {
    this.mapRep = m;
    this.actionHistory = a;
    this.parent = p;
    this.won = w;
    this.died = d;
    this.toValue = 0;
    this.m_depth = 0;
    this.children = [];

    if (this.parent != null)
        this.m_depth = parent.m_depth + 1;
    else
        this.m_depth = 0;
}

// TODO: timer & avgTimeTaken
function mctsSearch(rootMap, root) {
    let numIters = 0;
    while (numIters < MCTS_ITERATIONS) {
        let start = new Date().getTime();

        // selection & node expansion
        let selected = treePolicy(rootMap, root);
        // simulation
        let delta = selected.rollOut(rootMap, root);
        // backpropagation
        backUp(selected, delta);

        let end = new Date().getTime();
        console.log('['+i+'th iteration in mstsSearch] Time taken: ', (end - start)/1000 + 's');

    }

}

function treePolicy(rootMap, root){
    let cur = root;
    while (!cur.win && cur.m_depth < ROLLOUT_DEPTH){

    }
}

// VISIBLE FUNCTION FOR OTHER JS FILES (NODEJS)
module.exports = {
    step: function (init_state) {
        return iterSolve(init_state);
    },		// iterative step function (returns solution as list of steps from poss_actions or empty list)
    init: function (init_state) {
        return initAgent(init_state);
    },							// initializing function here
    best_sol: function () {
        return [];
    }				//returns closest solution in case of timeout
}

