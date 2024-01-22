/*
 * All content copyright http://www.j2eefast.com, unless
 * otherwise indicated. All rights reserved.
 * No deletion without permission
 */
package com.j2eefast.common.core.utils;
import java.io.FileNotFoundException;
import java.io.FileWriter;
import java.io.IOException;
import java.io.InputStream;
import java.util.LinkedHashMap;
import java.util.Map;

import cn.hutool.core.io.FileUtil;
import org.yaml.snakeyaml.DumperOptions;
import org.yaml.snakeyaml.Yaml;

import cn.hutool.core.util.StrUtil;

/**
 * Yml 处理类
 * @author zhouzhou
 * @date 2020-03-11 20:52
 */
public class YamlUtil{

    /**
     * 加载Yml文件转换成Map对象
     * @param fileName yml文件名称 例如: application.yml 自动识别相对或绝对路径，相对路径将自动从ClassPath下寻找
     * @return Map对象
     * @throws FileNotFoundException 文件打开失败异常
     */
    public static Map<?, ?> loadYaml(String fileName) throws FileNotFoundException{
        InputStream in = FileUtil.getInputStream(FileUtil.file(fileName));
        return ToolUtil.isNotEmpty(fileName) ? (LinkedHashMap<?, ?>) new Yaml().load(in) : null;
    }

    /**
     * 通过Map对象反写yml文件
     * @param fileName yml 文件
     * @param map map对象
     * @throws IOException Io错误
     */
    public static void dumpYaml(String fileName, Map<?, ?> map) throws IOException {
        if (ToolUtil.isNotEmpty(fileName)){
            FileWriter fileWriter = new FileWriter(YamlUtil.class.getResource(fileName).getFile());
            DumperOptions options = new DumperOptions();
            options.setDefaultFlowStyle(DumperOptions.FlowStyle.BLOCK);
            Yaml yaml = new Yaml(options);
            yaml.dump(map, fileWriter);
        }
    }
    /**
     * 加载Yml文件转换成Map对象
     * @param in 输入流
     * @return Map对象
     * @throws FileNotFoundException 文件打开失败异常
     */
    public static Map<?, ?> loadYaml(InputStream in) throws FileNotFoundException{
        return  (LinkedHashMap<?, ?>) new Yaml().load(in);
    }

    /**
     *  通过yml文件key获取对应value值
     * @param map yml文件map对象
     * @param qualifiedKey 查询的Key
     * @return 返回value对象值
     */
    public static Object getProperty(Map<?, ?> map, Object qualifiedKey) {
        if (map != null && !map.isEmpty() && qualifiedKey != null) {
            String input = String.valueOf(qualifiedKey);
            if (!"".equals(input)) {
                if (input.contains(StrUtil.DOT)) {
                    int index = input.indexOf(StrUtil.DOT);
                    String left = input.substring(0, index);
                    String right = input.substring(index + 1, input.length());
                    return getProperty((Map<?, ?>) map.get(left), right);
                }
                else if (map.containsKey(input)) {
                    return map.get(input);
                }
                else {
                    return null;
                }
            }
        }
        return null;
    }


    /**
     * 写入Yml
     * @param map yml Map对象
     * @param qualifiedKey Key
     * @param value value值
     */
    @SuppressWarnings("unchecked")
	public static void setProperty(Map<?, ?> map, Object qualifiedKey, Object value) {
        if (map != null && !map.isEmpty() && qualifiedKey != null) {
            String input = String.valueOf(qualifiedKey);
            if (!input.equals("")) {
                if (input.contains(StrUtil.DOT)) {
                    int index = input.indexOf(StrUtil.DOT);
                    String left = input.substring(0, index);
                    String right = input.substring(index + 1, input.length());
                    setProperty((Map<?, ?>) map.get(left), right, value);
                }
                else {
                    ((Map<Object, Object>) map).put(qualifiedKey, value);
                }
            }
        }
    }
}
