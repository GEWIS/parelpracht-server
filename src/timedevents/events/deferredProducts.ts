import ProductInstanceService from '../../services/ProductInstanceService';

export default async function deferredProducts() {
  await new ProductInstanceService().removeDeferredStatuses();
  console.log('All "deferred" statuses have been removed!');
  console.log('Good luck to the new board!!!');
  console.log('~ The 39th board of GEWIS');
}
