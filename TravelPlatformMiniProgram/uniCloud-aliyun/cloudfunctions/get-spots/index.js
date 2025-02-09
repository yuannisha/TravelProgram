'use strict';

const db = uniCloud.database()
const $ = db.command.aggregate
const spotCollection = db.collection('travel-spots')

exports.main = async (event, context) => {
	const {
		categoryId = 0, // 分类ID，0表示全部
		keyword = '', // 搜索关键词
		page = 1, // 页码
		pageSize = 10, // 每页数量
		sortBy = 'rating', // 排序字段：rating-评分 price-价格
		sortOrder = 'desc', // 排序方式：desc-降序 asc-升序
		longitude, // 经度
		latitude // 纬度
	} = event
	
	// 构建查询条件
	const matchCondition = {}
	
	// 分类筛选
	if (categoryId > 0) {
		matchCondition.categoryId = categoryId
	}
	
	// 关键词搜索
	if (keyword) {
		matchCondition.name = new RegExp(keyword, 'i')
	}
	
	// 构建聚合管道
	const pipeline = [{
		$match: matchCondition
	}]
	
	// 如果提供了经纬度，计算距离
	if (longitude && latitude) {
		pipeline.push({
			$geoNear: {
				near: {
					type: 'Point',
					coordinates: [parseFloat(longitude), parseFloat(latitude)]
				},
				distanceField: 'distance',
				spherical: true,
				distanceMultiplier: 0.001 // 转换为公里
			}
		})
	}
	
	// 添加排序
	if (sortBy === 'rating') {
		pipeline.push({
			$sort: {
				rating: sortOrder === 'desc' ? -1 : 1
			}
		})
	} else if (sortBy === 'price') {
		pipeline.push({
			$sort: {
				price: sortOrder === 'desc' ? -1 : 1
			}
		})
	}
	
	// 分页
	pipeline.push(
		{
			$skip: (page - 1) * pageSize
		},
		{
			$limit: pageSize
		}
	)
	
	// 查询总数
	const countPipeline = [{
		$match: matchCondition
	}, {
		$count: 'total'
	}]
	
	try {
		// 并行执行查询
		const [spots, countResult] = await Promise.all([
			spotCollection.aggregate(pipeline).end(),
			spotCollection.aggregate(countPipeline).end()
		])
		
		return {
			code: 0,
			message: 'success',
			data: {
				list: spots.data,
				total: countResult.data[0] ? countResult.data[0].total : 0,
				page,
				pageSize
			}
		}
	} catch (e) {
		return {
			code: -1,
			message: e.message || '获取景点列表失败'
		}
	}
} 