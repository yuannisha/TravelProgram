<template>
    <view class="container">
        <view class="logo">
            <image src="/static/logo.png" mode="aspectFit"></image>
            <text class="app-name">旅游平台</text>
            <text class="version">Version 1.0.0</text>
        </view>
        
        <view class="menu-list">
            <view class="menu-group">
                <view class="menu-item">
                    <view class="left">
                        <text class="iconfont icon-service"></text>
                        <text class="title">联系客服</text>
                    </view>
                    <text class="iconfont icon-arrow-right"></text>
                </view>
                <view class="menu-item">
                    <view class="left">
                        <text class="iconfont icon-feedback"></text>
                        <text class="title">意见反馈</text>
                    </view>
                    <text class="iconfont icon-arrow-right"></text>
                </view>
                <view class="menu-item">
                    <view class="left">
                        <text class="iconfont icon-privacy"></text>
                        <text class="title">隐私政策</text>
                    </view>
                    <text class="iconfont icon-arrow-right"></text>
                </view>
                <view class="menu-item">
                    <view class="left">
                        <text class="iconfont icon-agreement"></text>
                        <text class="title">用户协议</text>
                    </view>
                    <text class="iconfont icon-arrow-right"></text>
                </view>
            </view>
        </view>
        
        <view class="copyright">
            <text>Copyright © 2024 旅游平台</text>
            <text>All Rights Reserved</text>
        </view>
    </view>
</template>

<script>
/**
 * 关于页面
 * @description 展示应用信息
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

.logo {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 60rpx 0;
    
    image {
        width: 160rpx;
        height: 160rpx;
        margin-bottom: 20rpx;
    }
    
    .app-name {
        font-size: 36rpx;
        color: #333;
        font-weight: bold;
        margin-bottom: 10rpx;
    }
    
    .version {
        font-size: 24rpx;
        color: #999;
    }
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
            
            .icon-arrow-right {
                font-size: 24rpx;
                color: #999;
            }
        }
    }
}

.copyright {
    padding: 40rpx 0;
    text-align: center;
    
    text {
        display: block;
        font-size: 24rpx;
        color: #999;
        line-height: 1.8;
    }
}
</style> 