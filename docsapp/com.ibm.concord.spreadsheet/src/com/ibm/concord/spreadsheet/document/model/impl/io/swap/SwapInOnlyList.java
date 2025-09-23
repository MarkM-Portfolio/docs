package com.ibm.concord.spreadsheet.document.model.impl.io.swap;

import java.util.Collection;
import java.util.Iterator;
import java.util.List;
import java.util.ListIterator;

/**
 * Special list that can swap in raw data as model on-demand.
 */
public class SwapInOnlyList<E> implements List<E>
{
  private static final long serialVersionUID = -4463721102546467650L;

  private List<E> delegate;

  private ISwapInCapable theSwapIn;

  private boolean swappedIn;

  public SwapInOnlyList(List<E> d, ISwapInCapable swapIn)
  {
    delegate = d;
    theSwapIn = swapIn;
    swappedIn = false;
  }

  public void add(int location, E object)
  {
    swapIn();

    delegate.add(location, object);
  }

  public boolean add(E object)
  {
    swapIn();

    return delegate.add(object);
  }

  public boolean addAll(int location, Collection<? extends E> collection)
  {
    swapIn();
    return delegate.addAll(location, collection);
  }

  public boolean addAll(Collection<? extends E> collection)
  {
    swapIn();

    return delegate.addAll(collection);
  }

  public void clear()
  {
    swapIn();

    delegate.clear();
  }

  public boolean contains(Object object)
  {
    swapIn();

    return delegate.contains(object);
  }

  public boolean containsAll(Collection<?> collection)
  {
    swapIn();

    return delegate.containsAll(collection);
  }

  public E get(int location)
  {
    swapIn();
    return delegate.get(location);
  }

  public int indexOf(Object object)
  {
    swapIn();

    return delegate.indexOf(object);
  }

  public boolean isEmpty()
  {
    swapIn();

    return delegate.isEmpty();
  }

  public Iterator<E> iterator()
  {
    swapIn();

    return delegate.iterator();
  }

  public int lastIndexOf(Object object)
  {
    swapIn();

    return delegate.lastIndexOf(object);
  }

  public ListIterator<E> listIterator()
  {
    swapIn();

    return delegate.listIterator();
  }

  public ListIterator<E> listIterator(int location)
  {
    swapIn();
    return delegate.listIterator(location);
  }

  public E remove(int location)
  {
    swapIn();

    return delegate.remove(location);
  }

  public boolean remove(Object object)
  {
    swapIn();

    return delegate.remove(object);
  }

  public boolean removeAll(Collection<?> collection)
  {
    swapIn();

    return delegate.removeAll(collection);
  }

  public boolean retainAll(Collection<?> collection)
  {
    swapIn();

    return delegate.retainAll(collection);
  }

  public E set(int location, E object)
  {
    swapIn();

    return delegate.set(location, object);
  }

  public int size()
  {
    swapIn();

    return delegate.size();
  }

  public List<E> subList(int start, int end)
  {
    swapIn();

    return delegate.subList(start, end);
  }

  public Object[] toArray()
  {
    swapIn();

    return delegate.toArray();
  }

  public <T> T[] toArray(T[] array)
  {
    swapIn();

    return delegate.toArray(array);
  }

  private void swapIn()
  {
    if (!swappedIn)
    {
      swappedIn = true;
      theSwapIn.swapIn();
    }
  }

  @Override
  public String toString()
  {
    return delegate.toString();
  }
}
