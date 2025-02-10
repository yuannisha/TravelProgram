<template>
    <view class="container">
        <view class="menu-list">
            <view class="menu-group">
                <view class="menu-item">
                    <view class="left">
                        <text class="iconfont icon-notification"></text>
                        <text class="title">消息通知</text>
                    </view>
                    <switch color="#2B9939" />
                </view>
                <view class="menu-item">
                    <view class="left">
                        <text class="iconfont icon-location"></text>
                        <text class="title">位置信息</text>
                    </view>
                    <switch color="#2B9939" />
                </view>
            </view>
            
            <view class="menu-group">
                <view class="menu-item">
                    <view class="left">
                        <text class="iconfont icon-clear"></text>
                        <text class="title">清除缓存</text>
                    </view>
                    <text class="value">2.5MB</text>
                </view>
                <view class="menu-item">
                    <view class="left">
                        <text class="iconfont icon-version"></text>
                        <text class="title">当前版本</text>
                    </view>
                    <text class="value">1.0.0</text>
                </view>
            </view>
        </view>
    </view>
</template>

<script>
/**
 * 设置页面
 * @description 系统设置
 */
export default {
    data() {
        return {}
    },
    methods: {}
}
</script>

<style lang="scss">
.container {
    min-height: 100vh;
    background-color: #f5f5f5;
    padding: 20rpx;
}

.menu-list {
    .menu-group {
        background-color: #fff;
        border-radius: 12rpx;
        margin-bottom: 20rpx;
        
        .menu-item {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 30rpx;
            border-bottom: 1rpx solid #eee;
            
            &:last-child {
                border-bottom: none;
            }
            
            .left {
                display: flex;
                align-items: center;
                
                .iconfont {
                    font-size: 40rpx;
                    margin-right: 20rpx;
                    color: #2B9939;
                }
                
                .title {
                    font-size: 28rpx;
                    color: #333;
                }
            }
            
            .value {
                font-size: 28rpx;
                color: #999;
            }
        }
    }
}
</style> 