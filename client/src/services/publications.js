import api from './api'

export const getFeaturedPublications = () =>
  api.get('/publications/featured').then(r => r.data)

export const getPublications = (params = {}) =>
  api.get('/publications', { params }).then(r => r.data)

export const getPublicationBySlug = (slug) =>
  api.get(`/publications/${slug}`).then(r => r.data)

export const getCategories = () =>
  api.get('/categories').then(r => r.data)

export const getRecentShows = (params = {}) =>
  api.get('/shows', { params }).then(r => r.data)

export const getShows = (params = {}) =>
  api.get('/shows', { params }).then(r => r.data)

export const getShowBySlug = (slug) =>
  api.get(`/shows/${slug}`).then(r => r.data)

export const getArtistBySlug = (slug) =>
  api.get(`/artists/${slug}`).then(r => r.data)

export const getTeamMembers = () =>
  api.get('/team').then(r => r.data)
