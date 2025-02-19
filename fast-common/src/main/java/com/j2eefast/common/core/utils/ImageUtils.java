/**
 * Copyright (c) 2013-Now http://jeesite.com All rights reserved.
 */
package com.j2eefast.common.core.utils;
import java.awt.*;
import java.awt.image.BufferedImage;
import java.io.File;
import java.io.IOException;
import javax.imageio.ImageIO;
import cn.hutool.core.img.ImgUtil;
import cn.hutool.core.io.FileUtil;
import cn.hutool.core.util.StrUtil;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import net.coobird.thumbnailator.Thumbnails;
import net.coobird.thumbnailator.Thumbnails.Builder;

/**
 * 图片处理工具类
 * @author ThinkGem
 * @version 2018年12月31日
 * J2eeFAST二次修改
 */
public class ImageUtils {
    private static Logger                   LOG                     = LoggerFactory.getLogger(ImageUtils.class);

    /**
     * 缩略图生成，处理一些较大的图片，防止占用太多的网络资源
     */
    public static void thumbnails(File imageFile, int maxWidth, int maxHeight,
                                  String outputFormat,boolean press, String preessText){
        if (imageFile == null || !imageFile.exists() || (maxWidth <= 0 && maxHeight <= 0)){
            return;
        }
        // 只处理可以压缩的图片，如gif图片压缩后会出现黑色背景的情况
        String extension = FileUtil.extName(imageFile.getName());
        if (!StrUtil.containsAny(extension, "png", "jpg", "jpeg", "bmp", "ico")){
            return;
        }
        try{
            BufferedImage bufferedImage = ImageIO.read(imageFile);
            Builder<BufferedImage> bilder = Thumbnails.of(bufferedImage);
            if (bufferedImage != null){
                if (maxWidth > 0){
                    if (bufferedImage.getWidth() <= maxWidth){
                        bilder.width(bufferedImage.getWidth());
                    }else{
                        bilder.width(maxWidth);
                    }
                }
                if (maxHeight > 0){
                    if (bufferedImage.getHeight() <= maxHeight){
                        bilder.height(bufferedImage.getHeight());
                    }else{
                        bilder.height(maxHeight);
                    }
                }
                if (ToolUtil.isNotEmpty(outputFormat)){
                    bilder.outputFormat(outputFormat);
                }
                bilder.toFile(imageFile);

                if(press){
                    //添加水印
                    ImgUtil.write(ImgUtil.pressText(bufferedImage,preessText, Color.BLACK,new Font("Courier", Font.PLAIN, (int)20),0,0, (float)1),imageFile);
                }else{
                    //不添加水印
                    ImgUtil.write(bufferedImage,imageFile);
                }
            }
        }catch(IOException e){
            LOG.error("图片压缩失败：" + imageFile.getAbsoluteFile(), e);
        }
    }
}
