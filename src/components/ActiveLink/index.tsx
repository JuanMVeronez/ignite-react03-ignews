import Link, {LinkProps} from 'next/link'
import { useRouter } from 'next/router';
import { ReactElement, cloneElement } from 'react'

type ActiveLinkProps = LinkProps & {
  children: ReactElement;
  activeClassName: string
}

export default function ActiveLink({children, activeClassName, ...props}: ActiveLinkProps) {
  const { asPath } = useRouter()

  const className = asPath === props.href ? activeClassName : '' 

  return (
    <Link {...props}>
      {cloneElement(children, {className})}
    </Link>
  )
}