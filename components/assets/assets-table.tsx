'use client'

import { useState } from 'react'
import { Asset } from '@/types'
import { useAssets, useDeleteAsset } from '@/hooks/use-assets'
import { ASSET_TYPES, CURRENCIES } from '@/lib/constants'
import { useTranslation } from '@/lib/i18n'
import { Pencil, Trash2, MoreHorizontal } from 'lucide-react'

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { AssetFormDialog } from './asset-form-dialog'
import { DeleteAssetDialog } from './delete-asset-dialog'

export function AssetsTable() {
  const { data: assets, isLoading } = useAssets()
  const deleteAsset = useDeleteAsset()
  const { t, locale } = useTranslation()

  const [formOpen, setFormOpen] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [editingAsset, setEditingAsset] = useState<Asset | null>(null)
  const [deletingAsset, setDeletingAsset] = useState<Asset | null>(null)
  const [deleteLoading, setDeleteLoading] = useState(false)

  const handleEdit = (asset: Asset) => {
    setEditingAsset(asset)
    setFormOpen(true)
  }

  const handleDelete = (asset: Asset) => {
    setDeletingAsset(asset)
    setDeleteOpen(true)
  }

  const confirmDelete = async () => {
    if (!deletingAsset) return

    setDeleteLoading(true)
    try {
      await deleteAsset.mutateAsync(deletingAsset.id)
      setDeleteOpen(false)
      setDeletingAsset(null)
    } catch (error) {
      console.error('Failed to delete asset:', error)
    } finally {
      setDeleteLoading(false)
    }
  }

  const formatNumber = (value: number) => {
    return value.toLocaleString(locale === 'tr' ? 'tr-TR' : 'en-US', { 
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    })
  }

  const getQuantityLabel = (type: string, quantity: number) => {
    switch (type) {
      case 'gold': return `${formatNumber(quantity)} ${t('assets.units.gram')}`
      case 'stock': return `${formatNumber(quantity)} ${t('assets.units.shares')}`
      case 'crypto': return `${formatNumber(quantity)} ${t('assets.units.coins')}`
      default: return `${formatNumber(quantity)} ${t('assets.units.units')}`
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[...Array(5)].map((_, i) => (
          <Skeleton key={i} className="h-12 w-full" />
        ))}
      </div>
    )
  }

  if (!assets || assets.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">{t('assets.noAssets')}</p>
      </div>
    )
  }

  // Group assets by type
  const groupedAssets = assets.reduce((acc, asset) => {
    const type = asset.type
    if (!acc[type]) acc[type] = []
    acc[type].push(asset)
    return acc
  }, {} as Record<string, Asset[]>)

  return (
    <>
      <div className="space-y-6">
        {Object.entries(groupedAssets).map(([type, typeAssets]) => {
          const assetType = ASSET_TYPES[type as keyof typeof ASSET_TYPES]
          const supportsQuantity = ['gold', 'stock', 'crypto'].includes(type)
          
          return (
            <div key={type} className="space-y-2">
              <h3 className="font-semibold flex items-center gap-2">
                <span>{assetType?.icon}</span>
                <span>{t(`assets.types.${type}`)}</span>
                <Badge variant="secondary" className="ml-2">
                  {typeAssets.length}
                </Badge>
              </h3>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>{t('assets.name')}</TableHead>
                      {supportsQuantity && (
                        <TableHead className="text-right">{t('assets.quantity')}</TableHead>
                      )}
                      {supportsQuantity && (
                        <TableHead className="text-right">{t('assets.unitPrice')}</TableHead>
                      )}
                      <TableHead className="text-right">{t('assets.totalValue')}</TableHead>
                      <TableHead className="w-[80px]"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {typeAssets.map((asset) => {
                      const currency = CURRENCIES[asset.currency as keyof typeof CURRENCIES]
                      return (
                        <TableRow key={asset.id}>
                          <TableCell className="font-medium">
                            <div className="flex flex-col">
                              <span>{asset.name}</span>
                              {asset.purchase_date && (
                                <span className="text-xs text-muted-foreground">
                                  {new Date(asset.purchase_date).toLocaleDateString(locale === 'tr' ? 'tr-TR' : 'en-US')}
                                </span>
                              )}
                            </div>
                          </TableCell>
                          {supportsQuantity && (
                            <TableCell className="text-right">
                              {asset.quantity ? getQuantityLabel(type, asset.quantity) : '-'}
                            </TableCell>
                          )}
                          {supportsQuantity && (
                            <TableCell className="text-right">
                              {asset.unit_price ? (
                                <span>{currency.symbol}{formatNumber(asset.unit_price)}</span>
                              ) : '-'}
                            </TableCell>
                          )}
                          <TableCell className="text-right">
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <span className="font-semibold cursor-default">
                                  {currency.symbol}{formatNumber(asset.amount)}
                                </span>
                              </TooltipTrigger>
                              {asset.quantity && asset.unit_price && (
                                <TooltipContent>
                                  {getQuantityLabel(type, asset.quantity)} × {currency.symbol}{formatNumber(asset.unit_price)}
                                </TooltipContent>
                              )}
                            </Tooltip>
                          </TableCell>
                          <TableCell>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon">
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => handleEdit(asset)}>
                                  <Pencil className="h-4 w-4 mr-2" />
                                  {t('common.edit')}
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() => handleDelete(asset)}
                                  className="text-destructive"
                                >
                                  <Trash2 className="h-4 w-4 mr-2" />
                                  {t('common.delete')}
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      )
                    })}
                  </TableBody>
                </Table>
              </div>
            </div>
          )
        })}
      </div>

      <AssetFormDialog
        open={formOpen}
        onOpenChange={(open) => {
          setFormOpen(open)
          if (!open) setEditingAsset(null)
        }}
        asset={editingAsset}
      />

      <DeleteAssetDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        asset={deletingAsset}
        onConfirm={confirmDelete}
        loading={deleteLoading}
      />
    </>
  )
}
