/*!
 * Copyright (c) 2020-Now http://www.j2eefast.com All rights reserved.
 * No deletion without permission
 * @author ZhouZhou 2021年07月11日
 * J2eeFAST 修改支持自定义语法提示
 */
define("ace/snippets/ftl",["require","exports","module"], function(require, exports, module) {
    "use strict";
    exports.snippetText = {
    scope: 'ftl',
    snippetText: [
        {snippet:'pageTheme(页面顶部)',
         content:
"<@pageTheme mark=false>\n\
${1: // 页面公共头部..}\n\
</@pageTheme>",
        },
        {snippet:'header(头部、标题、导入JS、CSS)',
         content:
"<@header title=\"${1}\" libs=[${2}]>\n\
    ${3}\n\
</@header>"
        },
        {snippet:'f.form(表单)',
         content:
"<@f.form name=\"${1}\">\n\
    ${3:}\n\
</@f.form>"
        },
        {snippet:'footer(页面底部)',
         content:
"<@footer>\n\
    ${1}\n\
</@footer>"
        },
        {
            snippet: 'table(表格组件)',
            content:
"<@table id=\"${1}\">\n\
    ${2}\n\
</@table>\n\
"
        }
        ,
        {
            snippet: 'shiro(权限)',
            content:
"<@shiro.hasPermission name=\"${1}\">\n\
    ${2}\n\
</@shiro.hasPermission>\n\
"
        }
        ,
        {
            snippet: 'permission(JS权限)',
            content:
"${2:$}{permission.hasPermi(\"${1}\")}"
        }
        ,
        {
            snippet: 'script(JS脚本)',
            content:
"<script type=\"text/javascript\">\n\
    ${1}\n\
</script>\n\
"
        }
        ,
        {
            snippet: 'function(JS方法)',
            content:
"function${M1?: ${1:functionName}}($2) {\n\
		${0:$TM_SELECTED_TEXT}\n\
}${M2?;}${M3?,}${M4?)}\n\
"
        }
        ,
        {
            snippet: 'alert',
            content:
"alert(${1});"
        }
        ,
        {
            snippet: 'readonly',
            content:
"readonly=${1:true}"
        }
        ,
        {
            snippet: 'f.input(输入框组件)',
            content:
"<@f.input name=\"${1}\"/>"
        }
        ,
        {
            snippet: 'helpTip',
            content:
"helpTip=\"${1}\""
        }
        ,{
         snippet:"f.treeselect(树选择组件)",
         content:
"<@f.treeselect name=\"${1}\" value=\"${2}\" labelValue=\"{3}\" boxTitle=\"${4:弹出框标题}\" url=\"${5}\" placeholder=\"${6:输入提示}\"/>\n\
"
        }
        ,
        {
         snippet: "f.tableselect(表格组件)",
         content:
"<@f.tableselect name=\"${1}\" boxTitle=\"${2}\" url=\"${3}\" tableInfo=\"${4}\"/>"
        }
        ,
        {
         snippet: "link 引入样式",
         content:
"<link rel=\"${1}\" href=\"${2}\"/>"
        }
        ,
        {
         snippet: "tableCallback(表格组件回调函数)",
         content:
"function tableCallback(id, event, index, layero, nodes){\n\
    ${1}\n\
}"
        }
        ,{
         snippet: "div 提示",
         content:
"<div>\n\
 ${1}\n\
 </div>"
        }
        ,{
        snippet: "div. class",
        content:
"<div class=\"${1}\">\n\
 ${2}\n\
 </div>"
        },
        {
        snippet: "div#",
        content:
"<div id=\"${1}\">\n\
${2}\n\
</div>"
        },
        {
            snippet: "try (JS异常捕获)",
            content:
"try {\n\
    ${0:/* code */}\n\
} catch (e) {}"
        },
        {
            snippet: "jsons (JSON转换)",
            content:
"JSON.stringify(${1:object});"
        }
        ,
        {
            snippet:"include(前端模板引擎)",
            content:
"<#include \"/common/defaultEngine.html\"/>"
        }
        ,{
        snippet: 'f.textarea(多行输入组件)',
        content:
"<@f.textarea name=\"${1}\"/>"
        }
        ,{
        snippet: 'f.select(多选组件)',
        content:
"<@f.select name=\"${1}\"/>"
        }
        ,
        {
        snippet: '$function',
        content:
"$(function() {\n\
    ${1}\n\
});"
        },
        {
        snippet: 'i18n',
        content:
"${2:$}{i18n(\"${1}\")}"
        },
        {
            snippet: 'log(浏览器控制台日志)',
            content:
"console.log(${1})"
        },
        {
            snippet: '$i18(JS获取国际化)',
            content:
"$.i18n.text(\"${1}\")"
        }
    ]
}
exports.scope = "ftl";

});                (function() {
                    window.require(["ace/snippets/ftl"], function(m) {
                        if (typeof module == "object" && typeof exports == "object" && module) {
                            module.exports = m;
                        }
                    });
                })();
            