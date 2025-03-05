import ProductInstanceService from '../../services/ProductInstanceService';

export default async function deferredProducts() {
  await new ProductInstanceService().removeDeferredStatuses();
  console.warn('All "deferred" statuses have been removed!');
  console.info('Good luck to the new board!!!');
  console.info('~ The 39th board of GEWIS');
}
