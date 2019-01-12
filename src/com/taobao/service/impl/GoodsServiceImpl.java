package com.taobao.service.impl;

import com.taobao.dao.GoodsDao;
import com.taobao.entity.*;
import com.taobao.service.GoodsService;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;


@Service
public class GoodsServiceImpl implements GoodsService {
    @Autowired
    GoodsDao goods_dao;

    // 全网商品，获取数据
    @Override
    public GoodsJson getGoods(AjaxParameter pars) {
        List<SqlGoods> sql_goods = goods_dao.getGoods(pars);
        GoodsJson temp_json = new GoodsJson();
        temp_json.setGoods(transFormList(sql_goods));
        return temp_json;
    }

    // SqlGoods列表 ——>  Goods列表
    public List<Goods> transFormList(List<SqlGoods> sql_goods) {
        List<Goods> goods_list = new ArrayList<Goods>();
        for (int i = 0; i < sql_goods.size(); ++i) {
            Goods temp = new Goods();
            SqlGoods temp_sql = sql_goods.get(i);
            temp.transForm(temp_sql);
            goods_list.add(temp);
        }
        return goods_list;
    }

    //获取商品详情
    @Override
    public GoodsDetailJson getGoodsDetail(String goods_id) {
        GoodsDetailJson temp_json = new GoodsDetailJson();
        Goods temp_goods = new Goods();
        //商品详情
        temp_goods.transForm(goods_dao.getGoodsDetail(goods_id));
        temp_json.setGoods_detail(temp_goods);

        Integer cid = temp_goods.getCid();
        //该分类下商品总数
        Integer temp_count = goods_dao.getGoodsCountByCid(cid);
        //随机从哪行开始取推荐商品
        Integer temp_start = (int) Math.random() * temp_count;
        //随机取4条推荐商品
        Map<String, Object> temp_map = new HashMap<String,Object>();
        temp_map.put("goods_id", goods_id);
        temp_map.put("cid", cid);
        temp_map.put("start", temp_start);
        temp_map.put("num", 4);
        List<SqlGoods> tmep_sql_goods = goods_dao.getRecommendList(temp_map);
        temp_json.setGoods_list(transFormList(tmep_sql_goods));
        return temp_json;
    }

    //测试
    @Override
    public Integer test() {
        return null;
    }
}
