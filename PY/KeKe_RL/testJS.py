import js2py
#执行js代码
#获取时间戳的js代码
# js_text = '''
#       var r = new Date().getTime()
# '''
# r = KeKeAI_RL.eval_js(js_text) #执行js代码
# print(r)
#执行js函数法一：
# log = KeKeAI_RL.eval_js(open('./log.js','r',encoding='utf-8').read())
# print(log("我是阿牛！")) #直接将参数传给log就行
import execjs


print(execjs.get().name)



# js2py.translate_file(r'C:\Users\Ksco\ProgramProjects\GithubRepos\KekeCompetition\Keke_JS\agents\mcts_AGENT.js', 'mcts_AGENT.py')