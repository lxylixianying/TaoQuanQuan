// 域名加端口号
var base_url = 'http://localhost:8088';

//搜索框
var js_ceil_box;
// 筛选条件对象
var js_filter_container;
// 排序方式
var js_sort_way;
//商品列表
var js_goods_area;
// 请求错误计数器
var error_count = 0;

//Ajax获取数所需的参数
var search_data = {};

// 初始化函数
window.onload = function () {

    //直接回到顶部,没有动画
    scrollToTopDirect();
    // 搜索框吸顶
    initScroll();
    // 筛选
    initCatalogBox();
    // 排序
    initSortBtn();
    // 商品列表
    initGoodsList();
    // 窗口大小监听
    watchWindow();
    //首次加载商品数据
    firstLoad();
}

// 滚动事件   开始
function initScroll() {
    js_ceil_box = new Vue({
        el: ".js_ceil_box",
        data: {
            is_fixed: false,
            is_show: true,
            search_word: ""
        },
        methods: {
            initSearch: function () {
                var temp = decodeURI(window.location.search);
                var word = temp.substring(8, temp.length);
                console.log(word);
                // 加上这个后退异常
                var url = window.location.href;
                var valiable = url.split('?')[0];
                window.history.pushState({}, 0, valiable);
                // 加上这个后退异常
                if (word.length > 0 && word != undefined && word != 'all') {
                    this.search_word = word;
                    addProperty('word', this.search_word);
                } else {
                    loadGoods('');
                }
            },
            search: function () {

                if (now_page_name != 'search' && this.search_word != '') {
                    window.location.href = "search.html?search=" + encodeURI(this.search_word);
                }

                if (now_page_name == 'search' && this.search_word != '') {
                    // 不支持后退
                    scrollToTopDirect();
                    addProperty('word', this.search_word);
                    // 支持后退
                    // window.location.href = "search.html?search=" + encodeURI(this.search_word);
                }
                if (now_page_name == 'search' && this.search_word == '') {
                    // 不支持后退
                    search_data['word'] = '';
                    deleteProperty('word');
                    // 支持后退
                    // window.location.href = "search.html?search=all";
                }
            }
            // 
        }
    });

    // 当搜索框设置为fixed后，控制该元素显示，放在搜索框的位置
    var js_ceil_filler = new Vue({
        el: ".js_ceil_filler",
        data: {
            is_show: false
        }
    });
    window.onscroll = function () {
        // 滚动条距离顶部的高度
        var scroll_top = document.documentElement.scrollTop || window.pageYOffset;
        //  获取屏幕可是宽度
        var client_width = document.documentElement.clientWidth;
        // 搜索框吸顶  start
        if (scroll_top < 100) {
            js_ceil_box.is_fixed = false;
            js_ceil_box.is_show = true;
            js_ceil_filler.is_show = false;
        }

        if (client_width >= 992 && scroll_top >= 100) {
            js_ceil_box.is_fixed = true;
            js_ceil_box.is_show = true;
            js_ceil_filler.is_show = true;
        }
        if (client_width < 992 && scroll_top > 120) {
            js_ceil_box.is_fixed = true;
            js_ceil_box.is_show = false;
            js_ceil_filler.is_show = true;
        }
        // 搜索框吸顶   end

        // 滚动到底部加载更多数据   start
        //可视区的高度
        var window_height = document.documentElement.clientHeight;
        //滚动条的总高度
        var scroll_height = document.documentElement.scrollHeight;
        if (scroll_top + window_height + 1 >= scroll_height && js_goods_area.can_ajax && js_goods_area.is_more_goods) {
            loadNextPage();
        }
        // 滚动到底部加载更多数据   end
        // 滚动到顶部   start
        if (scroll_top > window_height) {
            js_goods_area.is_show_totop = true;
        } else {
            js_goods_area.is_show_totop = false;
        }
        // 滚动到顶部   end
    }
}

// 筛选对象  开始
function initCatalogBox() {
    // Vue App
    js_filter_container = new Vue({
        el: '.js_filter_container',
        data: {
            // 目录选择
            catalog_name: "分类:",
            catalog_value: '0',
            catalog_items: [{
                    name: "全部", // 目录名
                    value: 0, //目录对应值
                    is_select: true //是否被选中
                }, {
                    name: "女装",
                    value: 1,
                    is_select: false
                },
                {
                    name: "男装",
                    value: 2,
                    is_select: false
                },
                {
                    name: "内衣",
                    value: 3,
                    is_select: false
                },
                {
                    name: "数码家电",
                    value: 4,
                    is_select: false
                },
                {
                    name: "美食",
                    value: 5,
                    is_select: false
                },
                {
                    name: "美妆个护",
                    value: 6,
                    is_select: false
                },
                {
                    name: "母婴",
                    value: 7,
                    is_select: false
                },
                {
                    name: "鞋包配饰",
                    value: 8,
                    is_select: false
                },
                {
                    name: "家居家装",
                    value: 9,
                    is_select: false
                },
                {
                    name: "文体车品",
                    value: 10,
                    is_select: false
                },
                {
                    name: "其他",
                    value: 11,
                    is_select: false
                }
            ],
            // 多选筛选条件
            filter_name: '筛选:',
            filter_value: '', //当前(选中/取消)的是哪个,相应的从参数添加/删除
            filter_items: [{
                    name: '淘抢购', //名称   
                    index: 1, //必须使用自定义的index，否则监听filter_value的函数中出现异常出现-0
                    an_name: 'is_qiang', //搜索时的对应的参数名
                    is_select: false, //是否被选中
                    is_small_select: false //是否被选中(中小屏幕)
                }, {
                    name: '聚划算',
                    index: 2,
                    an_name: 'is_ju',
                    is_select: false,
                    is_small_select: false
                },
                {
                    name: '天猫',
                    index: 3,
                    an_name: 'is_tmall',
                    is_select: false,
                    is_small_select: false
                }, {
                    name: '金牌卖家',
                    index: 4,
                    an_name: 'is_gold',
                    is_select: false,
                    is_small_select: false
                }, {
                    name: '极有家',
                    index: 5,
                    an_name: 'is_ji',
                    is_select: false,
                    is_small_select: false
                }, {
                    name: '海淘',
                    index: 6,
                    an_name: 'is_hai',
                    is_select: false,
                    is_small_select: false
                },
                {
                    name: '运费险',
                    index: 7,
                    an_name: 'is_yun',
                    is_select: false,
                    is_small_select: false
                }
            ],
            //更多 筛选条件
            more_filter_name: '更多:',
            //券后价格区间筛选
            quan_item: {
                name: '券后价格区间',
                start_price: '', //最低价
                end_price: '', //最高价
                is_start_error: false, //输入是否合法
                is_end_error: false
            },
            //评分筛选
            score_item: {
                name: '动态评分≥',
                value: '',
                tip: ' (0分-5分)',
                is_error: false //输入是否合法
            },
            //销量筛选
            sale_item: {
                name: '总销量≥',
                value: '',
                is_error: false //输入是否合法
            },
            is_loading: false
        },
        created: function () {
            // 初始化目录
            this.catalog_value = '0';
        },
        methods: {
            // 单选目录事件
            selectCatalogItem: function (value) {
                this.catalog_value = value;
                for (var i = 0; i < this.catalog_items.length; ++i) {
                    this.catalog_items[i].is_select = false;
                }
                this.catalog_items[value].is_select = true;

                // 参数中添加目录信息
                if (this.catalog_value != 0) {
                    addProperty('goods_cid', this.catalog_value);
                } else {
                    deleteProperty('goods_cid');
                }
            },
            // 多选筛选条件事件
            multiSelect: function (index) {
                // 多选取消选中
                if (this.filter_items[index - 1].is_select) {
                    this.filter_items[index - 1].is_select = false;
                    this.filter_value = "-" + index;
                    // if (isMidSmallScreen()) {
                    //小屏幕下选中背景变橙色标志
                    this.filter_items[index - 1].is_small_select = false;
                    // }
                }
                // 多选选中
                else {
                    this.filter_items[index - 1].is_select = true;
                    this.filter_value = index;
                    // if (isMidSmallScreen()) {
                    this.filter_items[index - 1].is_small_select = true;
                    // }
                    //"淘抢购"和"聚划算"是互斥的
                    //当两个同时被选中时,取消之前被选中的那个
                    if (index == 1 && this.filter_items[1].is_select) {
                        //取消选中"聚划算"
                        this.filter_items[1].is_select = false;
                        this.filter_items[1].is_small_select = false;
                        // this.filter_value = "-2";
                        if (search_data.hasOwnProperty('is_ju')) {
                            delete search_data['is_ju'];
                        }
                    }
                    if (index == 2 && this.filter_items[0].is_select) {
                        //取消选中"淘抢购"
                        this.filter_items[0].is_select = false;
                        this.filter_items[0].is_small_select = false;
                        if (search_data.hasOwnProperty('is_qiang')) {
                            delete search_data['is_qiang'];
                        }
                    }
                }
                //向search_data中删除或添加参数
                var index_temp = parseInt(this.filter_value);
                if (index_temp < 0) {
                    index_temp = -index_temp;
                    deleteProperty(this.filter_items[index_temp - 1].an_name);
                } else {
                    addProperty(this.filter_items[index_temp - 1].an_name, '1');
                }
            },
            clear: function () {
                this.resetCatalogItem();
                this.resetMultiSelect();
                this.resetInput();
                js_goods_area.clearSearchData();
                window.scrollTo(0, 0);
                if (js_goods_area.can_ajax) {
                    //清空加载
                    loadGoods('');
                }
                console.log('Clear');
            },
            //重置目录
            resetCatalogItem: function () {
                this.catalog_value = '0';
                for (var i = 1; i < this.catalog_items.length; ++i) {
                    this.catalog_items[i].is_select = false;
                }
                this.catalog_items[0].is_select = true;
            },
            //重置多选
            resetMultiSelect: function () {
                this.filter_value = '';
                for (var i = 0; i < this.filter_items.length; ++i) {
                    this.filter_items[i].is_select = false;
                    this.filter_items[i].is_small_select = false;
                }
            },
            //重置输入框
            resetInput: function () {
                this.sale_item.value = '';
                this.score_item.value = '';
                this.quan_item.start_price = '';
                this.quan_item.end_price = '';
            },
            confirm: function () {
                this.checkAfterCoupon();
                this.deleteInputValue();
                this.addInputValue();
                console.log(search_data);
                if (js_goods_area.can_ajax && this.sale_item.value != '' || this.score_item.value != '' || this.quan_item.start_price != '' || this.quan_item.end_price != '') {
                    //确认 加载
                    loadGoods('input');
                }
                console.log('Confirm');
            },
            //检查券后价
            checkAfterCoupon: function () {
                if (isNumber(this.quan_item.start_price) && isNumber(this.quan_item.end_price)) {
                    var start = parseInt(this.quan_item.start_price);
                    var end = parseInt(this.quan_item.end_price);
                    if (start > end) {
                        var temp = this.quan_item.start_price;
                        this.quan_item.start_price = this.quan_item.end_price;
                        this.quan_item.end_price = temp;
                    }
                }
            },
            //从search_data中删除input
            deleteInputValue: function () {
                if (search_data.hasOwnProperty('sale_num')) {
                    delete search_data['sale_num'];
                }
                if (search_data.hasOwnProperty('dsr')) {
                    delete search_data['dsr'];
                }
                if (search_data.hasOwnProperty('start_price')) {
                    delete search_data['start_price'];
                }
                if (search_data.hasOwnProperty('end_price')) {
                    delete search_data['end_price'];
                }
            },
            //向search_data中添加input值
            addInputValue: function () {
                if (this.sale_item.value != '') {
                    search_data['sale_num'] = this.sale_item.value;
                }
                if (this.score_item.value != '') {
                    search_data['dsr'] = this.score_item.value;
                }
                if (this.quan_item.start_price != '') {
                    search_data['start_price'] = this.quan_item.start_price;
                }
                if (this.quan_item.end_price != '') {
                    search_data['end_price'] = this.quan_item.end_price;
                }
            },
            // 修复输入后在相应的value中残留的事件
            fixValueRemains: function (obj) {
                if (obj == this.sale_item) {
                    this.sale_item.value = obj.value.replace(/\D/g, "");
                }
                if (obj == this.score_item) {
                    this.score_item.value = obj.value.replace(/[^\d.]/g, "");
                }
                if (obj == this.quan_item) {
                    this.quan_item.start_price = obj.start_price.replace(/\D/g, "");
                    this.quan_item.end_price = obj.end_price.replace(/\D/g, "");
                }
            },
            // 
        }
    });
    // Vue App
}
// 筛选对象  结束

// 排序按钮   开始
function initSortBtn() {
    // Vue App
    js_sort_way = new Vue({
        el: '.js_sort_way',
        data: {
            is_show_side: false, //侧边栏当前是否显示
            is_show_shade: false, //遮罩
            sort_item: [{
                name: '综合', //名称
                type: '', //类型
                is_select: true //是否选中
            }, {
                name: '销量',
                type: 'goods_sale',
                is_select: false
                // 销量只有降序排序
            }, {
                name: '价格',
                type: 'goods_price',
                is_select: false,
                is_up: false //升序排序
            }],
            //  列表显示方式
            toggle_list: {
                is_first_icon: true
            }
        },
        methods: {
            // 价格排序
            sortByPrice: function () {
                this.changeSelectedColor(2);
                this.transformIcon();
                this.sort_item[2].is_up = !this.sort_item[2].is_up;
            },
            //  切换价格排序的icon
            transformIcon: function () {
                Velocity(this.$refs.js_transform, 'stop');
                if (!this.sort_item[2].is_up) {
                    Velocity(this.$refs.js_transform, {
                        'margin-top': '8px',
                        rotateZ: '-180deg'
                    });
                    // 价格升序排序
                    addProperty('sort', 'goods_price asc');
                } else {
                    Velocity(this.$refs.js_transform, {
                        'margin-top': '13px',
                        rotateZ: '0deg'
                    });
                    // 价格降序排序
                    addProperty('sort', 'goods_price desc');
                }
            },
            // 重置价格排序的icon
            resetPriceIcon: function () {
                Velocity(this.$refs.js_transform, 'stop');
                Velocity(this.$refs.js_transform, {
                    'margin-top': '13px',
                    rotateZ: '0deg'
                });
                this.sort_item[2].is_up = false;
            },
            // 切换列表显示方式
            toggleList: function () {
                this.toggle_list.is_first_icon = !this.toggle_list.is_first_icon;
                js_goods_area.toggle_list = !js_goods_area.toggle_list;
            },
            // 显示筛选侧边
            showSide: function () {
                if (isMidSmallScreen() && !this.is_show_side) {
                    this.stopSideAnimate();
                    this.is_show_shade = true;
                    this.is_show_side = true;
                    Velocity(js_filter_container.$refs.js_filter_container, {
                        'margin-left': '-300px'
                    });
                    console.log('显示侧边栏');
                }
            },
            // 隐藏筛选侧边
            hideSide: function () {
                if (isMidSmallScreen() && this.is_show_side) {
                    this.stopSideAnimate();
                    this.is_show_side = false;
                    this.is_show_shade = false;
                    Velocity(js_filter_container.$refs.js_filter_container, {
                        'margin-left': '0px'
                        // 同上
                    });
                    console.log('隐藏侧边栏');
                }
            },
            // 切换侧边显示状态
            toggleSide: function () {
                if (this.is_show_side) {
                    this.hideSide();
                } else {
                    this.showSide();
                }
            },
            // 停止侧边动画(防止操作频率过快导致异常)
            stopSideAnimate: function () {
                Velocity(js_filter_container.$refs.js_filter_container, 'stop');
            },
            // 切换排序方式
            changeSortWay: function (index, way) {
                this.changeSelectedColor(index);
                addProperty('sort', way);
            },
            // 改变被选中的排序按钮的颜色
            changeSelectedColor: function (index) {
                // 价格图标按钮重置
                if (index != 2) {
                    this.resetPriceIcon();
                }
                for (var i = 0; i < this.sort_item.length; ++i) {
                    this.sort_item[i].is_select = false;
                }
                this.sort_item[index].is_select = true;
            }
            // 事件 end
        }
    });
    // Vue App
}
// 排序按钮   结束

//商品列表   开始
function initGoodsList() {
    js_goods_area = new Vue({
        el: ".js_goods_area",
        data: {
            page_num: 1, //当前页码
            page_size: 20, //每页数据量
            list_items: [],
            clear_list_flag: false, //清空数组标志
            toggle_list: false, //切换列表显示方式
            is_loading: false, //排序加载动画
            is_loading_more: false, //加载下一页提示
            is_more_goods: true, //是否还有更多商品
            is_show_totop: false, //是否显示滚动到顶部按钮
            can_ajax: true
        },
        created: function () {
            this.initSearchData();
        },
        methods: {
            resetPageNum: function () {
                this.page_num = 1;
                search_data['page_num'] = this.page_num;
                search_data['page_size'] = this.page_size;
            },
            // 初始化search_data
            initSearchData: function () {
                this.resetPageNum();
                //特惠商品
                if (now_page_name == 'bargain') {
                    search_data['end_price'] = '10';
                }
                //百元精品
                if (now_page_name == 'hundred') {
                    search_data['end_price'] = '100';
                }
            },
            // 清空当前商品列表
            clearListItems: function () {
                this.list_items = [];
                this.resetPageNum();
            },
            // 重置search_data
            clearSearchData: function () {
                var temp = search_data['sort'];
                var word = search_data['word'];
                search_data = {};
                //保留排序方式
                if (temp != '' && temp != undefined && temp != null) {
                    search_data['sort'] = temp;
                }
                //搜索页面保留搜索关键词
                if (now_page_name == 'search' && word != '' && word != undefined && word != null) {
                    search_data['word'] = word;
                }
                //再次初始化
                this.initSearchData();
            },
            // 滚动到顶部
            scrollToTop: function () {
                Velocity(document.documentElement, 'scroll', {
                    offset: 0
                }, 2000);
            },
            // 跳转详情页
            goToDetail: function (goods_id) {
                window.location.href = "detail.html?goods_id=" + goods_id;
                console.log(goods_id);
            },
            // 显示运费险弹窗
            showLayer: function (index) {
                // Vue.set
                Vue.set(this.list_items[index], 'is_show_yun', true);
            },
            // 隐藏运费险弹窗
            hideLayer: function (index) {
                Vue.set(this.list_items[index], 'is_show_yun', false);
            }
            // 
        }
        // 
    });
}
// 商品列表  结束

// 监测窗口大小变化
function watchWindow() {
    checkWindowWidth();
    window.onresize = function () {
        checkWindowWidth();
    }
}

//首次加载
function firstLoad() {
    //非"搜索页"加载方式
    if (now_page_name != 'search' && js_goods_area.can_ajax) {
        //首次加载
        loadGoods('');
    }
    //"搜索页"加载方式
    if (now_page_name == 'search' && js_goods_area.can_ajax) {
        //首次加载
        js_ceil_box.initSearch();
        // loadGoods('');
    }
}

//搜索
function search() {
    js_ceil_box.search();
    return false;
}

// 判断窗口大小，根据窗口大小显示或隐藏元素
function checkWindowWidth() {
    if (!isMidSmallScreen()) {
        js_filter_container.catalog_name = "分类:";
        js_filter_container.filter_name = "筛选:";

        //虽然实际使用中几乎不存在设备的尺寸突然变大变小(除了开发者模式调试)
        //还是将该元素定位重置
        js_filter_container.$refs.js_filter_container.style.marginLeft = '0px';

    } else {
        js_filter_container.catalog_name = "分类";
        js_filter_container.filter_name = "筛选";

        //虽然实际使用中几乎不存在设备的尺寸突然变大变小(除了开发者模式调试)
        //还是将该元素定位重置
        // 这里不能将元素定位重置，当弹出输入法框的时候会触发onsize事件，从而调用这个事件
        // 造成侧栏自动隐藏
        // js_sort_way.hideSide();
        //小屏幕就显示列表切换按钮
    }
}

//判断当前是不是中小屏幕
function isMidSmallScreen() {
    var screen_width = document.body.clientWidth;
    if (screen_width >= 992) {
        return false;
    }
    return true;
}

// 鼠标按下事件（显示或隐藏侧边栏）   开始
function mouseDown(event) {
    var point = event || window.event;
    var screen_width = document.body.clientWidth;
    if (screen_width < 992 && screen_width - point.clientX > 300 && event.target != js_sort_way.$refs.js_show_side) {
        console.log('在侧栏外');
        js_sort_way.hideSide();
    }
    // if (event.target == js_sort_way.$refs.js_shade) {
    //     console.log('在侧栏外');
    //     js_sort_way.hideSide();
    // }
    if (event.target == js_sort_way.$refs.js_show_side) {
        console.log("单击筛选");
    }
}
// 鼠标按下事件   结束

//添加搜索参数属性
function addProperty(pro_name, pro_value) {
    search_data[pro_name] = pro_value;
    if (js_goods_area.can_ajax) {
        //添加参数加载
        loadGoods(pro_name);
    }
}

//删除搜索参数中的属性
function deleteProperty(pro_name) {
    if (search_data.hasOwnProperty(pro_name)) {
        delete search_data[pro_name];
        if (js_goods_area.can_ajax) {
            //删除参数加载 
            loadGoods(pro_name);
        }
    }
}

//加载商品
function loadGoods(pro_name) {
    //重置页码
    js_goods_area.resetPageNum();

    js_goods_area.can_ajax = false;
    //清空数组标志
    js_goods_area.clear_list_flag = true;
    // 隐藏"没有更多了..."
    js_goods_area.is_more_goods = true;
    //切换排序方式时显示"加载中..."
    js_goods_area.is_loading = true;

    if (pro_name != 'sort') {
        js_filter_container.is_loading = true;
    }
    setTimeout(function () {
        getGoods();
    }, 300);
}

//加载下一页
function loadNextPage() {
    js_goods_area.can_ajax = false;
    //清空数组标志
    js_goods_area.clear_list_flag = false;
    // 显示加载动画
    js_goods_area.is_loading_more = true;

    search_data['page_num'] = js_goods_area.page_num + 1;
    setTimeout(function () {
        getGoods();
        js_goods_area.page_num = js_goods_area.page_num + 1;
    }, 600);
}

// 获取商品
function getGoods() {
    axios({
        url: base_url + '/getGoods',
        method: 'get',
        params: search_data
    }).then(function (response) {
        //处理返回的数据
        taskData(response);
        js_goods_area.can_ajax = true; //可以加载下一页
        // console.log(response);
    }).catch(function (error) {
        error_count++;
        if (error_count >= 3) {
            js_goods_area.can_ajax = false;
        }
        closeLoading();
        console.log('请求商品数据出错: ' + error);
    });
}

// 处理返回的数据
function taskData(response) {
    // 清空数组
    if (js_goods_area.clear_list_flag) {
        js_goods_area.clearListItems();
    }
    //关闭动画
    closeLoading();
    // 判断返回的数据是否等于每页数据量(如果是，说明还有下一页,否则没有)
    if (response.data.goods.length == js_goods_area.page_size) {
        js_goods_area.is_more_goods = true;
    } else {
        // 保证加载动画结束后才出现"没有更多了..."提示
        setTimeout(function () {
            js_goods_area.is_more_goods = false;
        }, 300);
    }
    // 将返回的商品数据装入Vue对象中的数组中,显示到界面中
    if (response.data.goods != null && response.data.goods.length != 0) {
        for (var i = 0; i < response.data.goods.length; ++i) {
            var e = response.data.goods[i];
            if (e.is_ju == '-1') {
                e.is_ju = false;
            }
            if (e.is_qiang == '-1') {
                e.is_qiang = false;
            }
            if (e.is_yun == '-1') {
                e.is_yun = false;
            }
            if (e.is_gold == '-1') {
                e.is_gold = false;
            }
            if (e.is_ji == '-1') {
                e.is_ji = false;
            }
            if (e.is_hai == '-1') {
                e.is_hai = false;
            }
            js_goods_area.list_items.push(e);
        }
    }
}

//直接滚动到顶部,没有动画
function scrollToTopDirect() {
    Velocity(document.documentElement, 'scroll', {
        offset: 0
    });
}

//关闭加载动画
function closeLoading() {
    setTimeout(function () {
        js_goods_area.is_loading = false;
        js_filter_container.is_loading = false;
        js_goods_area.is_loading_more = false;
    }, 300);
}

//判断是否是数字
function isNumber(val) {
    var regPos = /^\d+(\.\d+)?$/; //非负浮点数
    if (regPos.test(val)) {
        return true;
    } else {
        return false;
    }
}

//只输入正整数
function onlyPositiveInt(event) {
    event.value = event.value.replace(/\D/g, '')
}

//0-5
function zeroToFive(event) {
    if (event.value[0] == '.') {
        event.value = event.value.substr(1);
    }
    event.value = event.value.replace(/[^\d.]/g, ''); //清除“数字”和“.”以外的字符  
    event.value = event.value.replace(/\.{2,}/g, "."); //只保留第一个. 清除多余的  

    if (isNumber(event.value)) {
        var temp = parseFloat(event.value);
        if (temp > 5) {
            event.value = '';
        }
    }
}

// 测试
function test() {
    axios({
        url: base_url + '/test',
        method: 'get',
        params: {
            test: 1
        }
    }).then(function (response) {
        console.log(response);
    }).catch(function (error) {

    });
}