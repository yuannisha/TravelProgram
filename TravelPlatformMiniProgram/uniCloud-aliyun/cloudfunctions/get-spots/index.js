'use strict';

const db = uniCloud.database()
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
	const where = {}
	
	// 分类筛选
	if (categoryId > 0) {
		where.categoryId = categoryId
	}
	
	// 关键词搜索
	if (keyword && keyword.trim()) {
		const searchKeyword = keyword.trim()
		console.log("搜索关键词", searchKeyword)
		where.$or = [
			{ name:  { $regex: searchKeyword, $options: 'i' }  },
			{ address:  { $regex: searchKeyword, $options: 'i' }  },
			{ description:  { $regex: searchKeyword, $options: 'i' }  }
		]
	}
	console.log("查询条件", where)
	try {
		// 查询总数
		const countResult = await spotCollection.where(where).count()

		console.log("总数",countResult)

		// 构建查询
		let query = spotCollection.where(where)
		
		// 排序
		if (sortBy === 'rating') {
			query = query.orderBy('rating', sortOrder === 'desc' ? 'desc' : 'asc')
		} else if (sortBy === 'price') {
			query = query.orderBy('price', sortOrder === 'desc' ? 'desc' : 'asc')
		}
		
		// 分页
		query = query.skip((page - 1) * pageSize).limit(pageSize)
		
		// 执行查询
		const result = await query.get()
		console.log("查询结果", result)

		// 如果有经纬度，计算距离
		let spots = result.data
		if (longitude && latitude) {
			spots = spots.map(spot => {
				if (spot.location && spot.location.coordinates) {
					const [spotLong, spotLat] = spot.location.coordinates
					const distance = calculateDistance(latitude, longitude, spotLat, spotLong)
					return { ...spot, distance: parseFloat(distance.toFixed(1)) }
				}
				return { ...spot, distance: null }
			})

			// 如果是按距离排序，在内存中进行排序
			if (sortBy === 'distance') {
				spots.sort((a, b) => {
					const distanceA = a.distance ?? Infinity
					const distanceB = b.distance ?? Infinity
					return sortOrder === 'asc' ? distanceA - distanceB : distanceB - distanceA
				})
			}
		}

		return {
			code: 0,
			message: 'success',
			data: {
				list: spots,
				total: countResult.total,
				page,
				pageSize,
				hasRecommend: spots.length === 0 // 添加标记表示是否需要显示推荐
			}
		}
	} catch (e) {
		console.error('搜索错误:', e)
		return {
			code: -1,
			message: e.message || '获取景点列表失败'
		}
	}
}

// 计算两点之间的距离（单位：公里）
function calculateDistance(lat1, lon1, lat2, lon2) {
	const R = 6371 // 地球半径（公里）
	const dLat = toRad(lat2 - lat1)
	const dLon = toRad(lon2 - lon1)
	const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
		Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
		Math.sin(dLon / 2) * Math.sin(dLon / 2)
	const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
	return R * c
}

function toRad(value) {
	return value * Math.PI / 180
} 