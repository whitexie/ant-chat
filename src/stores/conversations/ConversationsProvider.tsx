import type { Role } from '@/constants'
import type { ReactNode } from 'react'
import { useImmerReducer } from 'use-immer'
import { ConversationDispath, ConversationsContext } from './context'
import { conversationsReducer } from './reducer'

interface Props { children: ReactNode }

export function ConversationsProvider({ children }: Props) {
  const __testData: IConversation[] = [
    {
      id: 'yVRqRRx4h4BF4hdw5CCPl',
      title: '新对话1',
      messages: [
        {
          id: 'Zyp8y42g6yA0mzQwQ3hSw',
          role: 'user' as Role,
          content: '介绍下李白先生',
          createAt: 1736670632259,
        },
        {
          id: 'AI-KB6Hn1r5vsTaLcgTz2LYo',
          role: 'assistant' as Role,
          content: '李白（701年－762年），字太白，号青莲居士，唐代伟大的浪漫主义诗人，被后人誉为“诗仙”。他出生于西域碎叶城（今吉尔吉斯斯坦托克马克附近），祖籍陇西成纪（今甘肃天水）。李白自幼聪颖，博览群书，尤其喜爱道家思想和游侠文化。他的诗歌以豪放、飘逸、想象丰富著称，善于描绘自然风光和抒发个人情感。\n\n### 生平经历\n李白一生游历广泛，足迹遍布大江南北。他早年曾隐居山林，后因才华出众被唐玄宗召入长安，供奉翰林。然而，他性格豪放不羁，不愿受官场束缚，最终辞官而去，继续漫游天下。晚年因卷入永王李璘的叛乱事件，被流放夜郎（今贵州），途中遇赦，最终病逝于当涂（今安徽马鞍山）。\n\n### 诗歌成就\n李白的诗歌题材广泛，形式多样，既有豪放的《将进酒》《行路难》，也有婉约的《静夜思》《长干行》。他的作品充满了对自由、理想和人生的深刻思考，语言风格清新自然，意境深远，对后世影响极大。杜甫曾称赞他“笔落惊风雨，诗成泣鬼神”。\n\n### 代表作品\n1. **《将进酒》**  \n   君不见黄河之水天上来，奔流到海不复回。  \n   君不见高堂明镜悲白发，朝如青丝暮成雪。  \n   人生得意须尽欢，莫使金樽空对月。  \n   天生我材必有用，千金散尽还复来。  \n\n2. **《静夜思》**  \n   床前明月光，疑是地上霜。  \n   举头望明月，低头思故乡。  \n\n3. **《望庐山瀑布》**  \n   日照香炉生紫烟，遥看瀑布挂前川。  \n   飞流直下三千尺，疑是银河落九天。  \n\n### 影响与评价\n李白与杜甫并称为“李杜”，是中国古代诗歌史上的双子星座。他的诗歌不仅在中国广为流传，也对东亚文化圈产生了深远影响。他的作品被翻译成多种语言，成为世界文学宝库中的瑰宝。\n\n李白的一生充满了传奇色彩，他的诗歌和人生哲学至今仍激励着无数人追求自由与理想。',
          createAt: 1736670632954,
        },
        {
          id: 'hGDPyfdPZRqn9f152SgNM',
          role: 'user',
          content: '他有亲兄弟姐妹吗？',
          createAt: 1736688858636,
        },
        {
          id: 'AI-6GEYs-JkWn7uExBWVsXny',
          role: 'assistant',
          content: '关于李白的家庭背景，历史记载相对有限，尤其是关于他的兄弟姐妹的具体情况，史料中几乎没有明确的记载。李白出生于一个商人家庭，他的父亲李客可能是一位富商，但关于他的母亲和兄弟姐妹的信息非常稀少。\n\n根据一些推测和研究，李白可能有兄弟姐妹，但具体数量和名字无从考证。唐代的家庭结构通常较为庞大，尤其是富裕家庭，兄弟姐妹较多是常见现象。然而，由于缺乏确凿的历史记录，我们无法确定李白是否有亲兄弟姐妹，以及他们的具体情况。\n\n总的来说，李白的家庭背景和兄弟姐妹的情况在历史文献中是一个模糊的领域，目前只能通过有限的资料进行推测。',
          createAt: 1736688859226,
        },
      ],
      createAt: 1736670632261,
    },
    {
      id: '1yVRqRRx4h4BF4hdw5CCP2',
      title: '新对话2',
      messages: [
        {
          id: 'Zyp8y42g6yA0mzQwQ3hSw3',
          role: 'user' as Role,
          content: '介绍下李白',
          createAt: 1736670632259,
        },
        {
          id: 'AI-KB6Hn1r5vsTaLcgTz2LYo4',
          role: 'assistant' as Role,
          content: '李白（701年－762年），字太白，号青莲居士，唐代伟大的浪漫主义诗人，被后人誉为“诗仙”。他出生于西域碎叶城（今吉尔吉斯斯坦托克马克附近），充满了对自由、理想和人生的深刻思考，语言风格清新自然，意境深远，对后世影响极大。杜甫曾称赞他“笔落惊风雨，诗成泣鬼神”。\n\n### 代表作品\n1. **《将进酒》**  \n   君不见黄河之水天上来，奔流到海不复回。  \n   君不见高堂明镜悲白发，朝如青丝暮成雪。  \n   人生得意须尽欢，莫使金樽空对月。  \n   天生我材必有用，千金散尽还复来。  \n\n2. **《静夜思》**  \n   床前明月光，疑是地上霜。  \n   举头望明月，低头思故乡。  \n\n3. **《望庐山瀑布》**  \n   日照香炉生紫烟，遥看瀑布挂前川。  \n   飞流直下三千尺，疑是银河落九天。  \n\n### 影响与评价\n李白与杜甫并称为“李杜”，是中国古代诗歌史上的双子星座。他的诗歌不仅在中国广为流传，也对东亚文化圈产生了深远影响。他的作品被翻译成多种语言，成为世界文学宝库中的瑰宝。\n\n李白的一生充满了传奇色彩，他的诗歌和人生哲学至今仍激励着无数人追求自由与理想。',
          createAt: 1736670632954,
        },
      ],
      createAt: 1736670632261,
    },
  ]
  const [conversations, dispatch] = useImmerReducer(conversationsReducer, __testData)

  return (
    <ConversationsContext.Provider value={conversations}>
      <ConversationDispath.Provider value={dispatch}>
        {children}
      </ConversationDispath.Provider>
    </ConversationsContext.Provider>
  )
}
