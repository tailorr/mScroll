# 使用说明
## 概述
轻量级移动端滑屏组件
## 兼容 
大部分的移动端浏览器

## 使用
mScroll是一个类，每个需要使用滚动功能的区域均要进行初始化.<br/>
最佳的HTML结构如下：<br/>

       <div id="wrapper">
            <ul id="scroller">
                <li>...</li>
                <li>...</li>
                ...
            </ul>
        </div>
        
最基本的初始化的方式如下：<br/>

        <script type="text/javascript">
            var myScroll = new mScroll(selector);
        </script>
        
其中selector是一个querySelector字符串

## 参数
<em>bounce： </em>上拉下拉回弹效果，默认为false<br/>
<em>scrollBounce： </em>滚动到底部时是否有回弹效果，默认为false <br/>
<em>scrollBar： </em>是否创建滚动条，默认为false<br/>

## 回调函数
<em>scrollStart： </em>滚动开始时的回调<br/>
<em>scrollMove： </em>滚动过程中的回调<br/>
<em>scrollEnd： </em>滚动结束后的回调<br/>
## 方法

<em>refresh()</em> 加载数据后强制刷新DOM，解决了从后台加载的内容无法上滑的问题，一般在有后台加载的数据时调用。
