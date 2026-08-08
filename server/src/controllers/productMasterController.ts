import { Request, Response } from 'express';
import { ProductMasterModel } from '../models/ProductMaster';
import { createNotificationHelper } from './notificationController';

const generateProductCode = async (): Promise<string> => {
  const count = await ProductMasterModel.countDocuments();
  return `PRD-${new Date().getFullYear()}-${String(count + 1).padStart(3, '0')}`;
};

export const getProductsMaster = async (req: Request, res: Response) => {
  try {
    const { search = '', brand = '', category = '', lowStock = '' } = req.query;
    const query: any = {};

    if (search) {
      query.$or = [
        { productCode: { $regex: search, $options: 'i' } },
        { name: { $regex: search, $options: 'i' } },
        { brand: { $regex: search, $options: 'i' } },
        { modelNumber: { $regex: search, $options: 'i' } },
      ];
    }
    if (brand) query.brand = brand;
    if (category) query.category = category;

    let products = await ProductMasterModel.find(query).sort({ createdAt: -1 });

    if (lowStock === 'true') {
      products = products.filter((p) => p.stockQuantity <= p.reorderLevel);
    }

    return res.json({ success: true, data: products });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: 'Failed to fetch product master catalog.', error: err.message });
  }
};

export const getProductMasterById = async (req: Request, res: Response) => {
  try {
    const product = await ProductMasterModel.findById(req.params.id);
    if (!product) return res.status(404).json({ success: false, message: 'Product not found.' });
    return res.json({ success: true, data: product });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: 'Failed to fetch product.', error: err.message });
  }
};

export const createProductMaster = async (req: Request, res: Response) => {
  try {
    const { brand, modelNumber, name, category, capacity, baseMrp, sellingPrice, hsnCode, warehouseLocation, shelfBinLocation, reorderLevel, stockQuantity, description } = req.body;

    if (!brand || !modelNumber || !name || sellingPrice === undefined) {
      return res.status(400).json({ success: false, message: 'Brand, modelNumber, name, and sellingPrice are required.' });
    }

    const productCode = await generateProductCode();
    const product = await ProductMasterModel.create({
      productCode,
      brand,
      modelNumber,
      name,
      category: category || 'AIR_CONDITIONER',
      capacity: capacity || '',
      baseMrp: Number(baseMrp || sellingPrice),
      sellingPrice: Number(sellingPrice),
      hsnCode: hsnCode || '8415',
      warehouseLocation: warehouseLocation || 'Main Warehouse',
      shelfBinLocation: shelfBinLocation || 'Rack A-1',
      reorderLevel: Number(reorderLevel || 5),
      stockQuantity: Number(stockQuantity || 0),
      description: description || '',
    });

    if (product.stockQuantity <= product.reorderLevel) {
      await createNotificationHelper({
        title: 'Low Stock Alert Triggered',
        message: `${product.brand} ${product.modelNumber} is below safety reorder level! Stock: ${product.stockQuantity}`,
        type: 'WARNING',
        link: '/inventory/products-master',
      });
    }

    return res.status(201).json({ success: true, message: 'Product added to master catalog successfully.', data: product });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: 'Failed to create product master entry.', error: err.message });
  }
};

export const updateProductMaster = async (req: Request, res: Response) => {
  try {
    const product = await ProductMasterModel.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!product) return res.status(404).json({ success: false, message: 'Product not found.' });

    return res.json({ success: true, message: 'Product master updated successfully.', data: product });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: 'Failed to update product master.', error: err.message });
  }
};

export const deleteProductMaster = async (req: Request, res: Response) => {
  try {
    await ProductMasterModel.findByIdAndDelete(req.params.id);
    return res.json({ success: true, message: 'Product deleted from master catalog.' });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: 'Failed to delete product.', error: err.message });
  }
};
