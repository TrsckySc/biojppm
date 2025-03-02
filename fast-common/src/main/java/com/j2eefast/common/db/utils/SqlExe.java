/*
 * All content copyright http://www.j2eefast.com, unless
 * otherwise indicated. All rights reserved.
 * No deletion without permission
 */
package com.j2eefast.common.db.utils;

import javax.sql.DataSource;
import java.io.File;
import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.SQLException;
import java.util.*;
import cn.hutool.db.DbUtil;
import cn.hutool.db.handler.RsHandler;
import cn.hutool.db.sql.SqlExecutor;
import com.baomidou.mybatisplus.core.toolkit.CollectionUtils;
import com.baomidou.mybatisplus.core.toolkit.StringPool;
import com.baomidou.mybatisplus.extension.toolkit.SqlParserUtils;
import com.j2eefast.common.core.config.properties.DruidProperties;
import com.j2eefast.common.core.utils.ToolUtil;
import com.j2eefast.common.db.context.DataSourceContext;
import com.j2eefast.common.db.context.SqlSessionFactoryContext;
import lombok.extern.slf4j.Slf4j;
import net.sf.jsqlparser.JSQLParserException;
import net.sf.jsqlparser.expression.Alias;
import net.sf.jsqlparser.expression.Expression;
import net.sf.jsqlparser.expression.Function;
import net.sf.jsqlparser.parser.CCJSqlParserUtil;
import net.sf.jsqlparser.schema.Column;
import net.sf.jsqlparser.schema.Table;
import net.sf.jsqlparser.statement.select.*;
import org.apache.ibatis.session.SqlSession;
import org.apache.ibatis.session.SqlSessionFactory;
import org.springframework.core.io.ClassPathResource;
import org.springframework.core.io.FileSystemResource;
import org.springframework.core.io.support.EncodedResource;
import org.springframework.jdbc.datasource.init.ScriptUtils;
/**
 * 使用hutool SqlExecutor 执行器 单独执行SQL<br>
 * @author huanzhou
 * @date 2020-12-04 21:46
 */
@Slf4j
public class SqlExe {

    /**
     * 执行SQL查询语句
     * @param dataSource 数据源
     * @param sql 查询语句
     * @param params 参数
     * @return 结果Map集合
     */
    public static Map<String, Object> findOne(DataSource dataSource, String sql, Object... params) {
        RsHandler<Map<String, Object>> rsHandler = ToolUtil::resultSetToMap;
        Connection conn = null;
        try {
            conn = dataSource.getConnection();
            return SqlExecutor.query(conn, sql, rsHandler, params);
        } catch (SQLException e) {
            log.error("sql执行错误!", e);
            return new HashMap<>();
        } finally {
            DbUtil.close(conn);
        }
    }

    /**
     * 执行非查询语句<br>
     * 语句包括 插入、更新、删除<br>
     * @param dataSource 数据源名称
     * @param sql SQL (sql中有参数用?代替)
     * @param params 参数
     * @return  影响的行数
     */
    public static int update(DataSource dataSource, String sql, Object... params) {
        Connection conn = null;
        try {
            conn = dataSource.getConnection();
            return SqlExecutor.execute(conn, sql, params);
        } catch (SQLException e) {
            log.error("sql执行错误!", e);
            return 0;
        } finally {
            DbUtil.close(conn);
        }
    }

    /**
     * 执行系统文件脚本SQL
     * @author ZhouZhou
     * @date 2020-12-06 11:03
     * @param classpathFileName
     * @param dbName
     */
    public static void runClassPathSql(String classpathFileName, String dbName) {

        DruidProperties druidProperties = DataSourceContext.getDataSourcesConfs().get(dbName);
        Connection conn = null;
        try {
            Class.forName(druidProperties.getDriverClassName());
            conn = DriverManager.getConnection(druidProperties.getUrl(), druidProperties.getUsername(), druidProperties.getPassword());

            ClassPathResource classPathResource = new ClassPathResource(classpathFileName);
            EncodedResource encodedResource = new EncodedResource(classPathResource, "UTF-8");
            ScriptUtils.executeSqlScript(conn, encodedResource);
        } catch (Exception e) {
            log.error("执行sql错误！", e);
            throw new RuntimeException("执行sql错误！");
        }finally {
            DbUtil.close(conn);
        }
    }

    /**
     * 执行系统文件SQL
     * @author ZhouZhou
     * @date 2020-12-06 11:02
     * @param dbName 数据库名称
     * @param file 文件File对象
     */
    public static void runFileSql(String dbName, File file) {
        SqlSessionFactory sqlSessionFactory = SqlSessionFactoryContext.getSqlSessionFactorys().get(dbName);
        Connection conn = null;
        try {
            SqlSession sqlSession = sqlSessionFactory.openSession();
            conn = sqlSession.getConnection();
            FileSystemResource classPathResource = new FileSystemResource(file);
            EncodedResource encodedResource = new EncodedResource(classPathResource, "UTF-8");
            ScriptUtils.executeSqlScript(conn, encodedResource);
        } catch (Exception e) {
            log.error("执行sql错误！", e);
            throw new RuntimeException("执行sql错误！");
        }finally {
            DbUtil.close(conn);
        }
    }

}
