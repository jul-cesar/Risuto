import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import Image from "next/image";

export function SharedCard({ organization }: { organization: any }) {


  const { slug, name, image_url } = organization.organization;
  const { first_name, image_url: profile_image_url, user_name  } = organization.organization.created_by_user;
  const { role } = organization.role;
  const creatorFullName = `${user_name}`;
  const creatorInitials = `${first_name}`;

  console.log("SharedCard", organization);

  function getRoleBadgeClass(role: string): string {
    return role === "org:admin"
      ? "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200"
      : "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
  }

  return (
    <Link href={`/lists/${slug}`} className="flex-shrink-0">
      <Card className="w-80">
        <CardHeader className="flex items-center justify-between">
          <CardTitle className="text-base font-semibold">{name}</CardTitle>
          <Badge className={`text-xs px-2 py-1 rounded-full ${getRoleBadgeClass(role)}`}>
            {role === "org:admin" ? "Admin" : "Member"}
          </Badge>
        </CardHeader>
        <CardContent>
          <div className="w-full h-40 relative">
            <img
              src={image_url}
              alt={`Imagen de ${name}`}
              
              className="object-cover rounded-md"
              sizes="320px"
              
            />
          </div>    
        </CardContent>
        <CardFooter className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Avatar>
              <AvatarImage src={profile_image_url} alt={creatorFullName} />
              <AvatarFallback>{creatorInitials}</AvatarFallback>
            </Avatar>
            <div>
              <p className="text-sm font-medium">{creatorFullName}</p>
              <p className="text-xs text-muted-foreground">Created By</p>
            </div>
          </div>
          
        </CardFooter>
      </Card>
    </Link>
  )
}